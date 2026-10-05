import { useAuthStore } from './store';

export function useSession() {
  const { user, restaurant, loading, initialized, login, register, logout, loadSession, refreshProfile } =
    useAuthStore();
  return {
    user,
    restaurant,
    loading,
    initialized,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loadSession,
    refreshProfile,
  };
}
