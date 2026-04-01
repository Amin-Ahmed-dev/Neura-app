import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_left" }}>
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="app-settings" />
      <Stack.Screen name="parent-link" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
