import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSession } from '@/features/auth/hooks';
import { useBranchStore } from '@/features/branches/store';
import { useTheme } from '@/ui/theme/useTheme';
import { TabBar } from '../navigation/TabBar';

export default function TabsLayout() {
  const { loading, initialized, isAuthenticated, restaurant } = useSession();
  const { colors } = useTheme();
  const branches = useBranchStore((s) => s.branches);
  const branchesLoaded = useBranchStore((s) => s.loaded);
  const branchesLoading = useBranchStore((s) => s.loading);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  if (!initialized || loading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (restaurant && !restaurant.planSetupComplete) return <Redirect href="/select-plan" />;

  const needsBranch =
    branchesLoaded &&
    !branchesLoading &&
    branches.length > 1 &&
    !selectedBranchId;

  if (needsBranch) return <Redirect href="/select-branch" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'shift' }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="menu" />
      <Tabs.Screen name="operations" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
