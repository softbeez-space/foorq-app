import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { fetchCloseOut, recordCloseOut } from './api';
import { useBranchStore } from '@/features/branches/store';
import { useLocale } from '@/i18n/LocaleContext';

export function useCloseOut(date: string) {
  const branchId = useBranchStore((s) => s.selectedBranchId);
  return useQuery({
    queryKey: ['close-out', branchId, date],
    queryFn: () => fetchCloseOut(branchId!, date),
    enabled: !!branchId && !!date,
  });
}

export function useRecordCloseOut() {
  const qc = useQueryClient();
  const { t } = useLocale();
  return useMutation({
    mutationFn: recordCloseOut,
    onSuccess: (c: any) => {
      qc.invalidateQueries({ queryKey: ['close-out'] });
      Alert.alert(
        t('more.closeoutDoneT'),
        c.variance === 0 ? t('more.closeoutExact') : t('more.closeoutVariance', { v: c.variance })
      );
    },
    onError: (err: any) => {
      Alert.alert(t('more.closeoutFailT'), err?.response?.data?.message ?? t('more.tryAgain'));
    },
  });
}
