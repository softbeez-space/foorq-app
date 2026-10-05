import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQrDesign, saveQrDesign } from './api';

export function useQrDesign() {
  return useQuery({ queryKey: ['qr-design'], queryFn: fetchQrDesign, staleTime: 60_000 });
}

export function useSaveQrDesign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveQrDesign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qr-design'] });
      qc.invalidateQueries({ queryKey: ['restaurant-profile'] });
    },
  });
}
