import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useSession } from '@/features/auth/hooks';
import { useTheme } from '@/ui/theme/useTheme';

export default function Index() {
  const { loading, initialized, isAuthenticated, restaurant } = useSession();
  const { colors } = useTheme();

  if (!initialized || loading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (!isAuthenticated) return <Redirect href="/login" />;
  if (restaurant && !restaurant.planSetupComplete) return <Redirect href="/select-plan" />;

  return <Redirect href="/dashboard" />;
}
