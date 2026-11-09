import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { StepTracker } from '../../components/StepTracker';
import { orderApi } from '../../api/orderApi';
import { OrderDetailDto } from '../../types';
import { useDhaba } from '../../context/DhabaContext';
import { showConfirm, showAlert } from '../../utils/alert';

export const OrderTrackingScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const { outlet } = useDhaba();

  useEffect(() => {
    loadOrderDetail();
    // Simulate active status polling
    const interval = setInterval(() => {
      loadOrderDetail(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderDetail = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await orderApi.getById(orderId);
      setOrder(res);
    } catch (err) {
      console.warn('Failed to load order detail', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleCancel = () => {
    showConfirm(
      'Cancel Order',
      'Are you sure you want to cancel this order from Dhillon Dhaba?',
      async () => {
        try {
          setIsCancelling(true);
          const updated = await orderApi.cancelOrder(orderId, 'Customer requested cancellation');
          setOrder(updated);
          showAlert('Order Cancelled', 'Your order has been cancelled.');
        } catch (err: any) {
          showAlert('Error', err.response?.data?.message || 'Could not cancel order');
        } finally {
          setIsCancelling(false);
        }
      },
      'Yes, Cancel',
      'No, Keep Order'
    );
  };

  const handleCallDhaba = () => {
    const phone = outlet?.phone || '+919319036136';
    Linking.openURL(`tel:${phone}`);
  };

  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching order status...</Text>
      </View>
    );
  }

  const isLive = ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status);
  const canCancel = ['placed', 'confirmed'].includes(order.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
          <Text style={styles.headerSubtitle}>
            Placed on {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Estimated Time Card (if live) */}
        {isLive && (
          <View style={styles.etaCard}>
            <View style={styles.etaHeader}>
              <View>
                <Text style={styles.etaLabel}>Estimated Arrival</Text>
                <Text style={styles.etaTime}>
                  {order.estimatedDeliveryTime
                    ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '25-35 mins'}
                </Text>
              </View>
              <View style={styles.tandoorIconWrap}>
                <Ionicons name="flame" size={28} color={Colors.primary} />
              </View>
            </View>

            <Text style={styles.etaMessage}>
              Chef is preparing hot tandoor dishes & handi curries fresh for your meal.
            </Text>
          </View>
        )}

        {/* Step Progress Tracker */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Preparation & Delivery Timeline</Text>
          <StepTracker currentStatus={order.status} />
        </View>

        {/* Contact Dhaba Kitchen Bar */}
        <View style={styles.contactCard}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>{outlet?.name || 'Dhillon Dhaba'}</Text>
            <Text style={styles.contactDesc}>Need to change address or ask kitchen?</Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={handleCallDhaba} activeOpacity={0.8}>
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.callBtnText}>Call Dhaba</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Details */}
        {order.orderType === 'delivery' && order.deliveryAddressLine1 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Delivery Location</Text>
            <View style={styles.addressBox}>
              <Ionicons name="location-sharp" size={20} color={Colors.primary} />
              <View style={styles.addressContent}>
                <Text style={styles.addressMain}>{order.deliveryAddressLine1}</Text>
                {order.deliveryAddressLine2 && (
                  <Text style={styles.addressSub}>{order.deliveryAddressLine2}</Text>
                )}
                <Text style={styles.addressSub}>
                  {order.deliveryCity}, {order.deliveryPincode}
                </Text>
                {order.specialInstructions ? (
                  <Text style={styles.specialInstructions}>
                    Note: "{order.specialInstructions}"
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        )}

        {/* Itemized Receipt */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Dish Details</Text>
          <View style={styles.receiptCard}>
            {order.items.map(item => (
              <View key={item.id} style={styles.receiptItem}>
                <View style={styles.receiptItemInfo}>
                  <Text style={styles.receiptItemName}>
                    {item.quantity} x {item.itemName}
                  </Text>
                  {item.variantName && (
                    <Text style={styles.receiptVariant}>{item.variantName}</Text>
                  )}
                  {item.addons.map(a => (
                    <Text key={a.id} style={styles.receiptAddon}>
                      + {a.name} (₹{a.priceDelta})
                    </Text>
                  ))}
                </View>
                <Text style={styles.receiptSubtotal}>₹{item.subtotal.toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.receiptDivider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>Item Total</Text>
              <Text style={styles.receiptRowVal}>₹{order.itemTotal.toFixed(2)}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>Delivery Fee</Text>
              <Text style={styles.receiptRowVal}>₹{order.deliveryFee.toFixed(2)}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>Packaging Fee</Text>
              <Text style={styles.receiptRowVal}>₹{order.packagingFee.toFixed(2)}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>Taxes (GST)</Text>
              <Text style={styles.receiptRowVal}>₹{order.taxes.toFixed(2)}</Text>
            </View>

            {order.discountAmount > 0 && (
              <View style={styles.receiptRow}>
                <Text style={styles.discountLabel}>Coupon Discount ({order.appliedCouponCode})</Text>
                <Text style={styles.discountVal}>-₹{order.discountAmount.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.receiptDivider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.paymentMethodTag}>
                  Method: {order.paymentMethod.toUpperCase()} • Status: {order.paymentStatus.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.totalVal}>₹{order.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Cancellation button if allowed */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator color={Colors.badgeClosed} />
            ) : (
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    gap: 12,
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  scroll: {
    flex: 1,
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
  },
  etaCard: {
    backgroundColor: '#FFF8E1',
    borderColor: Colors.accent,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  etaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  etaTime: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  tandoorIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaMessage: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 6,
    lineHeight: 16,
  },
  sectionWrap: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  contactInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  contactDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  addressBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 10,
  },
  addressContent: {
    flex: 1,
  },
  addressMain: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  addressSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  specialInstructions: {
    fontSize: 11,
    color: '#F57C00',
    fontStyle: 'italic',
    marginTop: 4,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  receiptItemInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  receiptItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  receiptVariant: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  receiptAddon: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  receiptSubtotal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: Spacing.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  receiptRowLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  receiptRowVal: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  discountLabel: {
    fontSize: 12,
    color: Colors.badgeOpen,
    fontWeight: '600',
  },
  discountVal: {
    fontSize: 12,
    color: Colors.badgeOpen,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  paymentMethodTag: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: Colors.badgeClosed,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    color: Colors.badgeClosed,
    fontWeight: '700',
    fontSize: 13,
  },
});

