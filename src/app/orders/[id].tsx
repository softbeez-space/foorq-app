import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, ChefHat, ChevronDown, Clock, CreditCard, Printer, ShoppingBag, Truck, User, Utensils } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Screen } from '@/ui/Screen';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { StatusBadge } from '@/features/orders/components/StatusBadge';
import { useOrder, useUpdateOrderStatus, useMarkOrderAsPaid, useRefundOrder, useConfirmHeldOrder, useRejectOrder, useVerifyPickupCode } from '@/features/orders/hooks';
import { useAuthStore } from '@/features/auth/store';
import { useSelectedBranch } from '@/features/branches/store';
import { useTheme } from '@/ui/theme/useTheme';
import { fontFamilies, radii, spacing, typography } from '@/ui/theme/tokens';
import { formatCurrency, formatTime } from '@/shared/format';
import { pickupToken } from '@/shared/token';
import { useLocale } from '@/i18n/LocaleContext';
import type { OrderStatus, PaymentStatus, OrderType } from '@/shared/constants/status';

const NEXT_STATUS: Record<string, OrderStatus> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'served',
  served: 'completed',
};

const ORDER_TYPE_KEY: Record<OrderType, string> = {
  'dine-in': 'orders.type.dineIn',
  takeaway: 'orders.type.takeaway',
  delivery: 'orders.type.delivery',
};

const FLOW_STEPS = [
  { key: 'pending', labelKey: 'orders.detail.stepReceived' },
  { key: 'preparing', labelKey: 'orders.detail.stepPreparing' },
  { key: 'ready', labelKey: 'orders.detail.stepReady' },
  { key: 'served', labelKey: 'orders.detail.stepServed' },
];

function flowIndex(status: string): number {
  if (status === 'preparing') return 1;
  if (status === 'ready') return 2;
  if (status === 'served' || status === 'completed' || status === 'delivered') return 3;
  return 0;
}

function OrderTypeIcon({ type, size, color }: { type: OrderType; size: number; color: string }) {
  const Icon = type === 'dine-in' ? Utensils : type === 'takeaway' ? ShoppingBag : Truck;
  return <Icon size={size} color={color} />;
}

function paymentConfig(status: PaymentStatus, colors: ReturnType<typeof useTheme>['colors'], t: (key: string) => string) {
  switch (status) {
    case 'paid':
      return { bg: colors.successBg, text: colors.successText, label: t('orders.payment.paid') };
    case 'unpaid':
      return { bg: colors.warningBg, text: colors.warningText, label: t('orders.payment.unpaid') };
    case 'refunded':
      return { bg: colors.dangerBg, text: colors.dangerText, label: t('orders.payment.refunded') };
  }
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { data: order, isLoading } = useOrder(id!);
  const updateStatus = useUpdateOrderStatus();
  const markPaid = useMarkOrderAsPaid();
  const refund = useRefundOrder();
  const confirmHeld = useConfirmHeldOrder();
  const reject = useRejectOrder();
  const verify = useVerifyPickupCode();
  const [verifyCode, setVerifyCode] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectMessage, setRejectMessage] = useState('');
  const role = useAuthStore((s) => s.user?.role);
  const canRefund = role === 'owner' || role === 'manager';
  const [tendered, setTendered] = useState('');
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundMode, setRefundMode] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showMore, setShowMore] = useState(false);
  const restaurant = useAuthStore((s) => s.restaurant);
  const branch = useSelectedBranch();

  const handleStatusUpdate = useCallback(() => {
    if (!order) return;
    const next = NEXT_STATUS[order.status];
    if (next) updateStatus.mutate({ id: order._id, status: next });
  }, [order, updateStatus]);

  const handleMarkPaid = useCallback(() => {
    if (!order) return;
    const cash = tendered.trim();
    if (cash !== '') {
      const n = Number(cash);
      if (!Number.isFinite(n) || n < 0) {
        Alert.alert(t('orders.detail.invalidAmountT'), t('orders.detail.invalidAmountM'));
        return;
      }
      if (n < Math.round(order.total)) {
        Alert.alert(t('orders.detail.shortTenderT'), t('orders.detail.shortTenderM', { total: Math.round(order.total) }));
        return;
      }
      markPaid.mutate({ id: order._id, tendered: n });
    } else {
      markPaid.mutate({ id: order._id });
    }
    setTendered('');
  }, [order, markPaid, tendered]);

  const handleCancel = useCallback(() => {
    if (!order) return;
    if (!cancelReason.trim()) {
      Alert.alert(t('orders.detail.reasonRequiredT'), t('orders.detail.cancelReasonM'));
      return;
    }
    updateStatus.mutate({ id: order._id, status: 'cancelled', note: cancelReason.trim() });
    setCancelMode(false);
    setCancelReason('');
  }, [order, updateStatus, cancelReason]);

  const handleRefund = useCallback(() => {
    if (!order) return;
    if (!refundReason.trim()) {
      Alert.alert(t('orders.detail.reasonRequiredT'), t('orders.detail.refundReasonM'));
      return;
    }
    refund.mutate({ id: order._id, reason: refundReason.trim() });
    setRefundMode(false);
    setRefundReason('');
  }, [order, refund, refundReason]);

  const handleVerify = useCallback(() => {
    if (!order) return;
    if (!/^\d{6}$/.test(verifyCode.trim())) {
      Alert.alert(t('orders.detail.invalidCodeT'), t('orders.detail.invalidCodeM'));
      return;
    }
    verify.mutate({ id: order._id, code: verifyCode.trim() });
    setVerifyCode('');
  }, [order, verify, verifyCode]);

  const handleReject = useCallback(() => {
    if (!order) return;
    if (!rejectReason.trim()) {
      Alert.alert(t('orders.detail.reasonRequiredT'), t('orders.detail.internalReasonM'));
      return;
    }
    reject.mutate({
      id: order._id,
      reason: rejectReason.trim(),
      customerMessage: rejectMessage.trim() || undefined,
    });
    setRejectMode(false);
    setRejectReason('');
    setRejectMessage('');
  }, [order, reject, rejectReason, rejectMessage]);

  const lastPayment = order?.paymentEvents?.length
    ? order.paymentEvents[order.paymentEvents.length - 1]
    : null;

  const firstAt = useCallback(
    (status: string): string | undefined => {
      const ev = order?.statusHistory?.find((h) => h.status === status);
      return ev?.at;
    },
    [order],
  );

  const handlePrintReceipt = useCallback(async () => {
    if (!order) return;
    try {
      const itemsHtml = order.items
        .map(
          (item) =>
            `<tr><td style="padding:6px 0"><b>${item.name}${item.variant ? ` <span style="color:#94a3b8;font-size:10px">[${item.variant}]</span>` : ''}${item.addons.length ? `<br><span style="color:#94a3b8;font-size:9px">+ ${item.addons.join(', ')}</span>` : ''}</b></td><td style="text-align:center;padding:6px 0">${item.quantity}</td><td style="text-align:right;padding:6px 0;font-weight:700">৳${item.subtotal}</td></tr>`,
        )
        .join('');

      const discountAmount = order.discount?.amount ?? 0;
      const discountHtml = discountAmount > 0
        ? `<tr><td style="padding:3px 0;color:#ea580c">${t('orders.detail.receipt.discount')}${order.discount?.type === 'percentage' ? ` (${order.discount?.value ?? 0}%)` : ''}</td><td style="text-align:right;padding:3px 0;color:#ea580c;font-weight:700">- ৳${discountAmount.toFixed(2)}</td></tr>`
        : '';
      const vatLabel = order.taxMode === 'turnover'
        ? t('orders.detail.receipt.turnoverTax', { rate: order.vatRateApplied ?? 4 })
        : order.binSnapshot
          ? (order.vatRateApplied != null ? t('orders.detail.receipt.vatRate', { rate: order.vatRateApplied }) : t('orders.detail.receipt.vatMixed'))
          : t('orders.detail.receipt.taxFallback');
      const buyerHtml = order.buyerBin
        ? `<div class="info"><span>${t('orders.detail.receipt.buyer')}: ${order.buyerName || order.customerName || t('orders.detail.walkIn')}</span><span>BIN: ${order.buyerBin}</span></div>`
        : '';
      const binHtml = order.binSnapshot
        ? `<p class="muted" style="font-weight:700">BIN: ${order.binSnapshot}</p>`
        : '';

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      color: #0f172a;
      padding: 24px;
      max-width: 380px;
      margin: 0 auto;
    }
    .header { text-align: center; margin-bottom: 24px; }
    .header .logo {
      width: 48px; height: 48px; border-radius: 50%;
      object-fit: cover; margin-bottom: 8px;
      background: #0f172a; display: inline-flex;
      align-items: center; justify-content: center;
    }
    .header h1 { font-size: 20px; font-weight: 700; text-transform: uppercase; }
    .header p { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .header .muted { color: #94a3b8; font-weight: 400; letter-spacing: 0; text-transform: none; }
    .divider { border-top: 1px dashed #e2e8f0; margin: 16px 0; }
    .solid-divider { border-top: 1px solid #e2e8f0; margin: 16px 0; }
    .info { font-size: 11px; font-weight: 700; display: flex; justify-content: space-between; margin-bottom: 4px; }
    table { width: 100%; font-size: 11px; border-collapse: collapse; }
    thead th { border-bottom: 1px solid #f1f5f9; font-style: italic; padding: 8px 0; text-align: left; }
    thead th:last-child { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    .totals { font-size: 11px; }
    .totals .row { display: flex; justify-content: space-between; padding: 3px 0; }
    .totals .row .label { color: #64748b; }
    .totals .row .value { font-weight: 600; }
    .totals .total { font-size: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px; }
    .totals .total .value { font-weight: 900; }
    .footer { text-align: center; margin-top: 24px; }
    .footer p { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
    .footer .sub { font-size: 9px; color: #94a3b8; font-weight: 400; text-transform: none; letter-spacing: 0; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      ${restaurant?.logo ? `<img src="${restaurant.logo}" alt="logo" style="width:48px;height:48px;border-radius:50%;object-fit:cover" crossorigin="anonymous" />` : '<span style="color:#fff;font-size:20px">&#x1F374;</span>'}
    </div>
    <h1>${restaurant?.name || 'Restaurant'}</h1>
    <p>${branch?.name || t('orders.detail.receipt.mainBranch')}</p>
    <p class="muted">${branch?.address || ''}</p>
    <p class="muted">Tel: ${branch?.phone || ''}</p>
    ${binHtml}
  </div>

  <div class="divider"></div>

  <div class="info"><span>${t('orders.detail.receipt.orderNo')}${order.orderNumber}</span><span>${(() => { try { return new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } })()}</span></div>
  <div class="info"><span>${t('orders.detail.receipt.type')}: ${order.orderType.toUpperCase()}</span>${order.tableNumber ? `<span>${t('orders.detail.rowTable')}: ${order.tableNumber}</span>` : ''}</div>
  <div class="info" style="margin-bottom:16px"><span>${t('orders.detail.receipt.customer')}: ${order.customerName || t('orders.detail.walkIn')}</span></div>
  ${buyerHtml}

  <div class="solid-divider"></div>

  <table>
    <thead><tr><th>${t('orders.detail.receipt.item')}</th><th>${t('orders.detail.receipt.qty')}</th><th>${t('orders.detail.total')}</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div class="solid-divider"></div>

  <div class="totals">
    <div class="row"><span class="label">${t('orders.detail.subtotal')}</span><span class="value">৳${order.subtotal.toFixed(2)}</span></div>
    ${discountHtml}
    <div class="row"><span class="label">${vatLabel}</span><span class="value">৳${order.tax.toFixed(2)}</span></div>
    <div class="row total"><span class="label" style="font-weight:900">${t('orders.detail.total')}</span><span class="value" style="font-weight:900">৳${order.total.toFixed(2)}</span></div>
  </div>

  <div class="divider"></div>

  <div class="footer">
    <p>${t('orders.detail.receipt.thankYou')}</p>
    <p class="sub">${t('orders.detail.receipt.visitAgain')}</p>
    <div style="margin-top:16px;padding-top:16px;border-top:1px solid #f8fafc">
      <p class="sub">Powered by Foorq</p>
    </div>
  </div>
</body>
</html>`;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Receipt_${order.orderNumber}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        await Print.printAsync({ html });
      }
    } catch (err) {
      console.error('Print receipt failed', err);
    }
  }, [order, restaurant, branch, t]);

  const canAdvance = order && NEXT_STATUS[order.status] && order.status !== 'cancelled';
  const nextStatus = order ? NEXT_STATUS[order.status] : undefined;
  const isCancelled = order?.status === 'cancelled';
  // Action visibility: exactly one primary action, everything else grouped.
  const needsConfirmation = !!order?.requiresConfirmation;
  const showPayment = !!order && !needsConfirmation && order.paymentStatus === 'unpaid';
  const showVerify = !!order && order.origin === 'unbound-pickup' && order.status === 'pending' && !(order as any).verifyConsumedAt;
  const showReject = !!order && order.status === 'pending' && (order.requiresConfirmation || !(order as any).acceptedAt);

  const detailRows = useMemo(() => {
    if (!order) return [];
    const rows: { label: string; value: string }[] = [
      { label: t('orders.detail.rowOrderNumber'), value: `#${order.orderNumber}` },
      { label: t('orders.detail.rowPlaced'), value: formatTime(order.createdAt) },
      { label: t('orders.detail.rowCustomer'), value: `${order.customerName || t('orders.detail.walkIn')}${order.customerPhone ? ` · ${order.customerPhone}` : ''}` },
    ];
    if (order.orderType === 'dine-in' && order.tableNumber) {
      rows.push({ label: t('orders.detail.rowTable'), value: t('kitchen.table', { number: order.tableNumber }) });
    }
    (['confirmed', 'preparing', 'ready', 'served'] as const).forEach((s) => {
      const at = firstAt(s);
      if (at) {
        rows.push({
          label: t(`orders.status.${s}`),
          value: formatTime(at),
        });
      }
    });
    if (order.paymentMethod) {
      rows.push({ label: t('orders.detail.rowPaidVia'), value: order.paymentMethod });
    }
    if (lastPayment) {
      rows.push({ label: t('orders.detail.rowConfirmedAt'), value: formatTime(lastPayment.at) });
    }
    return rows;
  }, [order, firstAt, lastPayment, t]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Text style={{ color: colors.inkSoft }}>{t('orders.detail.notFound')}</Text>
        </View>
      </Screen>
    );
  }

  const pay = paymentConfig(order.paymentStatus, colors, t);
  const activeStep = flowIndex(order.status);

  return (
    <Screen>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityLabel={t('orders.detail.back')}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={handlePrintReceipt}
          style={[styles.printBtn, { backgroundColor: colors.surface2 }]}
          accessibilityLabel={t('orders.detail.printReceipt')}
        >
          <Printer size={17} color={colors.ink} />
        </Pressable>
      </View>

      <FlatList
        data={order.items}
        keyExtractor={(_, i) => String(i)}
        ListHeaderComponent={
          <>
            {/* Total hero (Snoonu receipt pattern) */}
            <Card style={[styles.hero, { backgroundColor: pay.bg }]}>
              <View style={styles.heroBadges}>
                <StatusBadge status={order.status} />
                <View style={[styles.paymentBadge, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.paymentBadgeText, { color: pay.text }]}>{pay.label}</Text>
                </View>
              </View>
              <Text style={[styles.heroTotal, { color: colors.ink, fontFamily: fontFamilies.display }]}>
                {formatCurrency(order.total)}
              </Text>
              <View style={styles.metaRow}>
                <OrderTypeIcon type={order.orderType} size={13} color={colors.inkSoft} />
                <Text style={[styles.meta, { color: colors.inkSoft }]}>
                  #{order.orderNumber} · {t(ORDER_TYPE_KEY[order.orderType])}
                  {order.orderType === 'dine-in' && order.tableNumber ? ` · ${t('kitchen.table', { number: order.tableNumber })}` : ''}
                </Text>
                <View style={[styles.metaDot, { backgroundColor: colors.inkSoft }]} />
                <Clock size={13} color={colors.inkSoft} />
                <Text style={[styles.meta, { color: colors.inkSoft }]}>{formatTime(order.createdAt)}</Text>
              </View>
              {order.customerName && (
                <View style={styles.customerRow}>
                  <User size={14} color={colors.inkSoft} />
                  <Text style={[styles.customerName, { color: colors.ink }]}>{order.customerName}</Text>
                </View>
              )}
            </Card>

            {/* Status stepper (Chipotle tracker pattern) */}
            {!isCancelled ? (
              <Card style={styles.stepper}>
                <View style={styles.stepsRow}>
                  {FLOW_STEPS.map((s, i) => {
                    const done = i < activeStep;
                    const current = i === activeStep;
                    const dotColor = done || current ? colors.primary : colors.border;
                    return (
                      <View key={s.key} style={styles.step}>
                        <View style={[styles.stepDot, { backgroundColor: dotColor }]}>
                          {done && <Text style={styles.stepCheck}>✓</Text>}
                        </View>
                        <Text
                          style={[
                            styles.stepLabel,
                            { color: done || current ? colors.ink : colors.inkSoft },
                            current && styles.stepLabelCurrent,
                          ]}
                        >
                          {t(s.labelKey)}
                        </Text>
                        {i < FLOW_STEPS.length - 1 && (
                          <View
                            style={[
                              styles.connector,
                              { backgroundColor: i < activeStep ? colors.primary : colors.border },
                            ]}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </Card>
            ) : (
              <Card style={[styles.cancelledBanner, { backgroundColor: colors.dangerBg }]}>
                <Text style={[styles.cancelledTitle, { color: colors.dangerText }]}>{t('orders.detail.cancelledTitle')}</Text>
                {!!order.statusHistory?.length && (
                  <Text style={[styles.cancelledSub, { color: colors.dangerText }]}>
                    {order.statusHistory[order.statusHistory.length - 1]?.note || ''}
                  </Text>
                )}
              </Card>
            )}

            {order.orderType === 'takeaway' && (
              <View style={[styles.tokenHero, { backgroundColor: colors.ink }]}>
                <Text style={[styles.tokenLabel, { color: '#ffffff88' }]}>{t('orders.detail.tokenBanner')}</Text>
                <Text style={[styles.tokenValue, { color: '#fff' }]}>{pickupToken(order.orderNumber)}</Text>
                {!!order.customerName && (
                  <Text style={[styles.tokenName, { color: '#ffffffaa' }]}>
                    {t('orders.detail.tokenNameHint', { name: order.customerName.split(' ')[0] })}
                  </Text>
                )}
              </View>
            )}

            <Card style={styles.itemsCard}>
              <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('orders.detail.items', { count: order.items.length })}</Text>
              <View style={styles.itemList}>
              {order.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <View style={[styles.qtyBadge, { backgroundColor: colors.surface2 }]}>
                      <Text style={[styles.qtyText, { color: colors.ink }]}>{item.quantity}x</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: colors.ink }]}>{item.name}</Text>
                      {item.variant && (
                        <Text style={[styles.itemDetail, { color: colors.inkSoft }]}>{item.variant}</Text>
                      )}
                      {item.addons.length > 0 && (
                        <Text style={[styles.itemDetail, { color: colors.inkSoft }]}>
                          + {item.addons.join(', ')}
                        </Text>
                      )}
                      {item.specialInstructions ? (
                        <Text style={[styles.itemNote, { color: colors.amber }]}>
                          {t('orders.detail.note', { note: item.specialInstructions })}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <Text style={[styles.itemPrice, { color: colors.ink }]}>{formatCurrency(item.subtotal)}</Text>
                </View>
              ))}
              </View>
            </Card>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.inkSoft }]}>{t('orders.detail.subtotal')}</Text>
                <Text style={[styles.summaryValue, { color: colors.ink }]}>{formatCurrency(order.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.inkSoft }]}>{t('orders.detail.tax')}</Text>
                <Text style={[styles.summaryValue, { color: colors.ink }]}>{formatCurrency(order.tax)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.summaryLabelTotal, { color: colors.ink }]}>{t('orders.detail.total')}</Text>
                <Text style={[styles.summaryValueTotal, { color: colors.ink }]}>{formatCurrency(order.total)}</Text>
              </View>
            </Card>

            {/* Order details with timestamps (Snoonu pattern) */}
            <Card style={styles.detailsCard}>
              <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t('orders.detail.detailsTitle')}</Text>
              {detailRows.map((r) => (
                <View key={r.label} style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.inkSoft }]}>{r.label}</Text>
                  <Text style={[styles.detailValue, { color: colors.ink }]}>{r.value}</Text>
                </View>
              ))}
            </Card>
          </>
        }
        renderItem={() => null}
        ListFooterComponent={
          <View style={styles.actions}>
            {/* ── Primary: one main action at a time ── */}
            {needsConfirmation ? (
              <>
                <View style={[styles.holdBanner, { backgroundColor: colors.warningBg }]}>
                  <Text style={[styles.holdTitle, { color: colors.warningText }]}>{t('orders.detail.needsCheck')}</Text>
                  <Text style={[styles.holdSub, { color: colors.warningText }]}>
                    {t('orders.detail.reviewFire')}
                  </Text>
                </View>
                <Button
                  onPress={() => confirmHeld.mutate({ id: order._id })}
                  loading={confirmHeld.isPending}
                  size="lg"
                  shape="pill"
                  leftIcon={<ChefHat size={18} color="#FFF" />}
                >
                  {t('orders.detail.confirmFire')}
                </Button>
              </>
            ) : canAdvance ? (
              <Button
                onPress={handleStatusUpdate}
                loading={updateStatus.isPending}
                size="lg"
                shape="pill"
                leftIcon={<ChefHat size={18} color="#FFF" />}
              >
                {nextStatus ? t('orders.detail.markAs', { status: t(`orders.status.${nextStatus}`) }) : ''}
              </Button>
            ) : null}

            {/* ── Payment ── */}
            {showPayment && (
              <View>
                <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('orders.detail.payment')}</Text>
                <Card style={styles.paymentCard}>
                  <Input
                    label={t('orders.detail.cashLabel')}
                    value={tendered}
                    onChangeText={setTendered}
                    placeholder={t('orders.detail.cashPlaceholder', { total: Math.round(order.total) })}
                    keyboardType="numeric"
                  />
                  <Button
                    onPress={handleMarkPaid}
                    loading={markPaid.isPending}
                    variant="secondary"
                    size="lg"
                    shape="pill"
                    leftIcon={<CreditCard size={18} color="#FFF" />}
                  >
                    {t('orders.detail.markPaid')}
                  </Button>
                  {typeof lastPayment?.change === 'number' && lastPayment.change > 0 && (
                    <Text style={[styles.changeHint, { color: colors.inkSoft }]}>
                      {t('orders.detail.changeHint', { change: lastPayment.change })}
                    </Text>
                  )}
                </Card>
              </View>
            )}

            {/* ── Guest pickup code ── */}
            {showVerify && (
              <View>
                <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('orders.detail.pickupCode')}</Text>
                <Card style={styles.verifyCard}>
                  <TextInput
                    value={verifyCode}
                    onChangeText={(t) => setVerifyCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder={t('orders.detail.codePlaceholder')}
                    placeholderTextColor={colors.inkSoft}
                    keyboardType="numeric"
                    maxLength={6}
                    style={[styles.input, styles.verifyInput, { borderColor: colors.border, color: colors.ink }]}
                  />
                  <Button onPress={handleVerify} loading={verify.isPending} shape="pill">
                    {t('orders.detail.verifyFire')}
                  </Button>
                </Card>
              </View>
            )}

            {/* ── Reject ── */}
            {showReject && !rejectMode && (
              <Button variant="outline" onPress={() => setRejectMode(true)} shape="pill">
                {t('orders.detail.reject')}
              </Button>
            )}
            {rejectMode && (
              <View>
                <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t('orders.detail.reject')}</Text>
                <Card style={styles.stackCard}>
                  <Input
                    label={t('orders.detail.rejectReasonLabel')}
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    placeholder={t('orders.detail.rejectReasonPh')}
                  />
                  <Input
                    label={t('orders.detail.guestMsgLabel')}
                    value={rejectMessage}
                    onChangeText={setRejectMessage}
                    placeholder={t('orders.detail.guestMsgPh')}
                  />
                  <Button onPress={handleReject} loading={reject.isPending} size="lg" shape="pill">
                    {t('orders.detail.confirmReject')}
                  </Button>
                  <Button variant="ghost" onPress={() => { setRejectMode(false); setRejectReason(''); setRejectMessage(''); }}>
                    {t('orders.detail.backBtn')}
                  </Button>
                </Card>
              </View>
            )}

            <Pressable
              onPress={() => setShowMore((v) => !v)}
              style={[styles.moreToggle, { borderColor: colors.border }]}
              accessibilityLabel={t('orders.detail.moreActions')}
            >
              <Text style={[styles.moreText, { color: colors.inkSoft }]}>
                {showMore ? t('orders.detail.fewerActions') : t('orders.detail.moreActions')}
              </Text>
              <ChevronDown
                size={16}
                color={colors.inkSoft}
                style={showMore ? { transform: [{ rotate: '180deg' }] } : undefined}
              />
            </Pressable>

            {showMore && (
              <View style={styles.moreBody}>
                {order.paymentStatus === 'paid' && canRefund && !refundMode && (
                  <Button variant="outline" onPress={() => setRefundMode(true)} shape="pill">
                    {t('orders.detail.refundCash')}
                  </Button>
                )}
                {refundMode && (
                  <Card style={styles.stackCard}>
                    <Input
                      label={t('orders.detail.refundReasonLabel')}
                      value={refundReason}
                      onChangeText={setRefundReason}
                      placeholder={t('orders.detail.auditPh')}
                    />
                    <Button onPress={handleRefund} loading={refund.isPending} size="lg" shape="pill">
                      {t('orders.detail.confirmRefund')}
                    </Button>
                    <Button variant="ghost" onPress={() => { setRefundMode(false); setRefundReason(''); }}>
                      {t('orders.detail.backBtn')}
                    </Button>
                  </Card>
                )}
                {order.status !== 'cancelled' && !cancelMode && (
                  <Button variant="outline" onPress={() => setCancelMode(true)} shape="pill">
                    {t('orders.detail.cancelOrder')}
                  </Button>
                )}
                {cancelMode && (
                  <Card style={styles.stackCard}>
                    <Input
                      label={t('orders.detail.cancelReasonLabel')}
                      value={cancelReason}
                      onChangeText={setCancelReason}
                      placeholder={t('orders.detail.auditPh')}
                    />
                    <Button onPress={handleCancel} loading={updateStatus.isPending} size="lg" shape="pill">
                      {t('orders.detail.confirmCancel')}
                    </Button>
                    <Button variant="ghost" onPress={() => { setCancelMode(false); setCancelReason(''); }}>
                      {t('orders.detail.backBtn')}
                    </Button>
                  </Card>
                )}
                <Button variant="outline" onPress={handlePrintReceipt} shape="pill" leftIcon={<Printer size={18} />}>
                  {t('orders.detail.printReceiptBtn')}
                </Button>
              </View>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  printBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  hero: { padding: 18, marginBottom: spacing.md, gap: 10 },
  heroBadges: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  paymentBadgeText: {
    fontSize: typography.micro.size,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTotal: { fontSize: 44, lineHeight: 50 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: typography.caption.size },
  metaDot: { width: 3, height: 3, borderRadius: 1.5 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  customerName: { fontSize: typography.body.size, fontWeight: '600' },
  stepper: { padding: 18, marginBottom: spacing.md },
  stepsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  step: { flex: 1, alignItems: 'center', gap: 6, position: 'relative' },
  stepDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  stepCheck: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepLabel: { fontSize: typography.micro.size, fontWeight: '600', textAlign: 'center' },
  stepLabelCurrent: { fontWeight: '800' },
  connector: { position: 'absolute', top: 11, left: '62%', right: '-38%', height: 2, borderRadius: 1 },
  cancelledBanner: { padding: 16, marginBottom: spacing.md, gap: 4 },
  cancelledTitle: { fontSize: typography.h2.size, fontWeight: '800' },
  cancelledSub: { fontSize: typography.caption.size },
  tokenHero: { alignItems: 'center', paddingVertical: 16, borderRadius: 12, marginBottom: 24 },
  tokenLabel: { fontSize: typography.micro.size, fontWeight: '700', letterSpacing: 1 },
  tokenValue: { fontSize: 44, fontWeight: '800' },
  tokenName: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  verifyInput: { textAlign: 'center', fontSize: 20, fontWeight: '700', letterSpacing: 4 },
  itemsCard: { marginBottom: spacing.md },
  itemList: { gap: 14, marginTop: spacing.md },
  sectionTitle: { fontSize: typography.h2.size, fontWeight: '700', marginBottom: spacing.md },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  itemLeft: { flexDirection: 'row', gap: 10, flex: 1 },
  qtyBadge: {
    width: 36,
    height: 28,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { fontSize: typography.caption.size, fontWeight: '700' },
  itemInfo: { flex: 1, gap: 1 },
  itemName: { fontSize: typography.body.size, fontWeight: '600' },
  itemDetail: { fontSize: typography.caption.size, marginTop: 1 },
  itemNote: { fontSize: typography.caption.size, marginTop: 1, fontStyle: 'italic' },
  itemPrice: { fontSize: typography.body.size, fontWeight: '700' },
  summaryCard: { marginBottom: spacing.md, gap: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalRow: { marginTop: 6 },
  summaryLabel: { fontSize: typography.body.size },
  summaryValue: { fontSize: typography.body.size, fontWeight: '600' },
  summaryLabelTotal: { fontSize: typography.h2.size, fontWeight: '700' },
  summaryValueTotal: { fontSize: typography.h2.size, fontWeight: '700' },
  detailsCard: { marginBottom: spacing.xl },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
  detailLabel: { fontSize: typography.caption.size },
  detailValue: { fontSize: typography.caption.size, fontWeight: '700', textAlign: 'right', flex: 1 },
  actions: { gap: spacing.md, paddingBottom: 40 },
  eyebrow: { fontSize: typography.micro.size, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  stackCard: { gap: spacing.md },
  paymentCard: { gap: spacing.md },
  verifyCard: { gap: spacing.md },
  scroll: { paddingTop: 14, paddingBottom: 24 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.body.size,
  },
  holdBanner: { gap: 4, padding: spacing.md, borderRadius: radii.card },
  holdTitle: { fontSize: typography.body.size, fontWeight: '700' },
  holdSub: { fontSize: typography.caption.size },
  changeHint: { fontSize: typography.caption.size, textAlign: 'center' },
  moreToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.pill,
  },
  moreText: { fontSize: typography.caption.size, fontWeight: '700' },
  moreBody: { gap: spacing.md },
});
