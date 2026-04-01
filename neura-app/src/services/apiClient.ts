import axios, { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/store/authStore";

export const TOKEN_KEY = "neura_auth_token";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 → logout ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
