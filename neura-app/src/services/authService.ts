import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { apiClient, TOKEN_KEY } from "./apiClient";
import type { User } from "@/store/authStore";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// ── Firebase init (singleton) ─────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
};

// Only initialize Firebase if config is valid
let app;
let firebaseAuth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  firebaseAuth = getAuth(app);
  
  if (isExpoGo && !process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
    console.warn("⚠️ Firebase not configured - auth features will not work in Expo Go");
  }
} catch (error: any) {
  console.error("Firebase initialization error:", error.message || error);
  // Create a mock auth object for UI testing
  firebaseAuth = null as any;
  
  // Suppress the error in Expo Go
  if (isExpoGo) {
    console.warn("⚠️ Firebase auth disabled in Expo Go - UI testing mode only");
  }
}

export { firebaseAuth };

// ── Helpers ───────────────────────────────────────────────────────────────────
async function saveToken(firebaseUser: FirebaseUser): Promise<string> {
  const token = await firebaseUser.getIdToken();
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  return token;
}

// ── Auth Service ──────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Register with email/password → Firebase → backend user record
   */
  async register(payload: {
    name: string;
    email: string;
    password: string;
    studentType: string;
  }): Promise<User> {
    if (!firebaseAuth) {
      throw new Error("Firebase not initialized. Please configure Firebase or use a development build.");
    }
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      payload.email,
      payload.password
    );
    await saveToken(credential.user);
    const { data } = await apiClient.post<{ user: User }>("/auth/register", {
      name: payload.name,
      studentType: payload.studentType,
    });
    return data.user;
  },

  /**
   * Login with email/password → Firebase → backend session
   */
  async login(email: string, password: string): Promise<User> {
    if (!firebaseAuth) {
      throw new Error("Firebase not initialized. Please configure Firebase or use a development build.");
    }
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    await saveToken(credential.user);
    const { data } = await apiClient.post<{ user: User }>("/auth/login");
    return data.user;
  },

  /**
   * Restore session on app launch — checks Firebase auth state
   * Returns the user if session is valid, null otherwise
   */
  async restoreSession(): Promise<User | null> {
    if (!firebaseAuth) {
      console.warn("Firebase not initialized - skipping session restore");
      return null;
    }
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        unsubscribe();
        if (!firebaseUser) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          resolve(null);
          return;
        }
        try {
          // Refresh token silently
          const token = await firebaseUser.getIdToken(true);
          await SecureStore.setItemAsync(TOKEN_KEY, token);
          const { data } = await apiClient.post<{ user: User }>("/auth/login");
          resolve(data.user);
        } catch {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          resolve(null);
        }
      });
    });
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    if (!firebaseAuth) {
      throw new Error("Firebase not initialized. Please configure Firebase or use a development build.");
    }
    await sendPasswordResetEmail(firebaseAuth, email);
  },

  /**
   * Sign out from Firebase + clear local token
   */
  async logout(): Promise<void> {
    if (firebaseAuth) {
      await signOut(firebaseAuth);
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
