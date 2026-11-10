import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/lib/auth';

function AuthRedirector() {
  const { loading, user } = useAuth();
  const segments = useSegments();
  const currentRoute = segments[0];
  const isPublicRoute = segments.some((segment) => String(segment) === 'login' || String(segment) === 'register');

  if (loading || !currentRoute) return null;
  if (user && isPublicRoute) return <Redirect href="/(tabs)/home" />;
  if (!user && !isPublicRoute) return <Redirect href="/login" />;
  return null;
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <AuthProvider>
      <AuthRedirector />
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
