import { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Screen } from '@/ui/Screen';
import { Button } from '@/ui/Button';
import { useTheme } from '@/ui/theme/useTheme';
import { typography } from '@/ui/theme/tokens';
import { api } from '@/shared/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale } from '@/i18n/LocaleContext';

// Two entry points, one camera:
// - default (kitchen): scan the guest's pickup QR → verify + fire to kitchen.
// - ?mode=review (home): scan → open order details so staff can review
//   and tap "Confirm & fire to kitchen" themselves.
export default function ScanVerifyScreen() {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const reviewMode = mode === 'review';
  const { t } = useLocale();
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const doneRef = useRef(false);

  const handleScan = useCallback(
    async ({ data }: { data: string }) => {
      if (busy || doneRef.current) return;
      const m = /^ROS-PICKUP:([a-f0-9]{24}):(\d{6})$/.exec((data || '').trim());
      if (!m) {
        // Review mode: tell staff this isn't an order QR (guarded so the
        // alert fires once, not on every camera frame).
        if (reviewMode) {
          doneRef.current = true;
          Alert.alert(t('orders.scan.notQrT'), t('orders.scan.notQrM'), [
            {
              text: t('orders.scan.retry'),
              onPress: () => {
                doneRef.current = false;
              },
            },
            { text: t('orders.scan.cancel'), style: 'cancel', onPress: () => router.back() },
          ]);
        }
        return; // not a pickup QR
      }
      doneRef.current = true;
      // Review mode: open the order for staff to check + accept. The
      // detail screen already offers "Confirm & fire to kitchen".
      if (reviewMode) {
        router.replace(`/orders/${m[1]}` as any);
        return;
      }
      setBusy(true);
      try {
        const res = await api.post(`/orders/${m[1]}/verify`, { code: m[2] });
        const order = res.data.data;
        qc.invalidateQueries({ queryKey: ['orders'] });
        qc.invalidateQueries({ queryKey: ['held-orders'] });
        Alert.alert(t('orders.scan.verifiedT'), t('orders.scan.verifiedM', { number: order.orderNumber }), [
          { text: t('orders.scan.ok'), onPress: () => router.back() },
        ]);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? t('orders.scan.invalidDefault');
        Alert.alert(t('orders.scan.failedT'), msg, [
          {
            text: t('orders.scan.retry'),
            onPress: () => {
              doneRef.current = false;
              setBusy(false);
            },
          },
          { text: t('orders.scan.cancel'), style: 'cancel', onPress: () => router.back() },
        ]);
      }
    },
    [busy, qc, reviewMode, t]
  );

  if (!permission) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={{ color: colors.inkSoft }}>{t('orders.scan.loadingCam')}</Text>
        </View>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.ink }]}>{t('orders.scan.camNeeded')}</Text>
          <Text style={[styles.sub, { color: colors.inkSoft }]}>
            {t('orders.scan.camHint')}
          </Text>
          <Button onPress={requestPermission} size="lg">
            {t('orders.scan.allow')}
          </Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#fff" />
        </Pressable>
        <Text style={styles.topTitle}>{reviewMode ? t('orders.scan.titleReview') : t('orders.scan.titleScan')}</Text>
        <View style={{ width: 22 }} />
      </View>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScan}
      />
      <View style={styles.hint}>
        <Text style={styles.hintText}>
          {busy
            ? t('orders.scan.verifying')
            : reviewMode
              ? t('orders.scan.hintReview')
              : t('orders.scan.hintDefault')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  title: { fontSize: typography.h2.size, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: typography.body.size, textAlign: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: '#000',
  },
  topTitle: { color: '#fff', fontSize: typography.h2.size, fontWeight: '700' },
  camera: { flex: 1 },
  hint: { backgroundColor: '#000', padding: 20, alignItems: 'center' },
  hintText: { color: '#ffffffaa', fontSize: typography.caption.size, textAlign: 'center' },
});
