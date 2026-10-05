import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { fetchRestaurant, updateRestaurant, updateVatSettings, uploadLogo } from './api';

export function useRestaurant() {
  return useQuery({
    queryKey: ['restaurant-settings'],
    queryFn: fetchRestaurant,
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => updateRestaurant(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
  });
}

export function useUpdateVatSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVatSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
  });
}

export function useUploadLogo() {
  return useMutation({
    mutationFn: (fileUri: string) => uploadLogo(fileUri),
  });
}
