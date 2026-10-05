import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="select-plan" />
      <Stack.Screen name="select-branch" />
      <Stack.Screen name="setup-branch" />
    </Stack>
  );
}
