import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { BillBreakdown } from '../../components/BillBreakdown';
import { useCart } from '../../context/CartContext';
import { useDhaba } from '../../context/DhabaContext';
import { orderApi } from '../../api/orderApi';
import { CreateOrderDto } from '../../types';

export const CheckoutScreen = ({ navigation }: any) => {
  const {
    items,
    itemTotal,
    deliveryFee,
    packagingFee,
    taxes,
    discountAmount,
    totalAmount,
    appliedCoupon,
    orderType,
    specialInstructions,
    clearCart,
  } = useCart();

  const { addresses, selectedAddress, setSelectedAddress } = useDhaba();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

  const handlePlaceOrder = async () => {
    if (orderType === 'delivery' && !selectedAddress) {
      Alert.alert('Address Required', 'Please select or add a delivery address to proceed.');
      return;
    }

    try {
      setIsPlacingOrder(true);
      const dto: CreateOrderDto = {
        orderType,
        deliveryAddressId: orderType === 'delivery' ? selectedAddress?.id : undefined,
        paymentMethod,
        specialInstructions: specialInstructions || undefined,
      };

      const createdOrder = await orderApi.createOrder(dto);

      if (paymentMethod === 'online') {
        // Create payment intent
        await orderApi.createPaymentIntent({
          orderId: createdOrder.id,
          method: 'upi',
        });
      }

      clearCart();
      Alert.alert(
        '🎉 Order Placed Successfully!',
        `Your Dhaba feast order #${createdOrder.orderNumber} has been received by the kitchen.`,
        [
          {
            text: 'Track Order',
            onPress: () => {
              navigation.replace('OrderTracking', { orderId: createdOrder.id });
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Order Failed', err.response?.data?.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Checkout</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section */}
        {orderType === 'delivery' && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile', { screen: 'AddressManager' })}
              >
                <Text style={styles.addAddressText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {addresses.map(addr => {
              const isSelected = selectedAddress?.id === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addressItem, isSelected && styles.addressItemSelected]}
                  onPress={() => setSelectedAddress(addr)}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? Colors.primary : Colors.textMuted}
                  />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addrLabel}>{addr.label}</Text>
                    <Text style={styles.addrLine}>{addr.line1}</Text>
                    <Text style={styles.addrCity}>
                      {addr.city}, {addr.pincode}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {addresses.length === 0 && (
              <TouchableOpacity
                style={styles.noAddressBtn}
                onPress={() => navigation.navigate('Profile', { screen: 'AddressManager' })}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.noAddressText}>No address found. Tap to add address.</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Payment Methods */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {/* Online Payment */}
          <TouchableOpacity
            style={[styles.paymentRow, paymentMethod === 'online' && styles.paymentRowSelected]}
            onPress={() => setPaymentMethod('online')}
          >
            <View style={styles.radioRow}>
              <Ionicons
                name={paymentMethod === 'online' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={paymentMethod === 'online' ? Colors.primary : Colors.textMuted}
              />
              <View>
                <Text style={styles.paymentName}>Online Payment (UPI, Cards, NetBanking)</Text>
                <Text style={styles.paymentDesc}>Fast & contactless payment via Razorpay / Dev Stub</Text>
              </View>
            </View>
            <Ionicons name="shield-checkmark" size={18} color={Colors.badgeOpen} />
          </TouchableOpacity>

          {/* Cash on Delivery */}
          <TouchableOpacity
            style={[styles.paymentRow, paymentMethod === 'cod' && styles.paymentRowSelected]}
            onPress={() => setPaymentMethod('cod')}
          >
            <View style={styles.radioRow}>
              <Ionicons
                name={paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={paymentMethod === 'cod' ? Colors.primary : Colors.textMuted}
              />
              <View>
                <Text style={styles.paymentName}>Cash on Delivery (COD)</Text>
                <Text style={styles.paymentDesc}>Pay with cash or UPI when food arrives</Text>
              </View>
            </View>
            <Ionicons name="cash-outline" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Order Bill Breakdown */}
        <BillBreakdown
          itemTotal={itemTotal}
          deliveryFee={deliveryFee}
          packagingFee={packagingFee}
          taxes={taxes}
          discountAmount={discountAmount}
          totalAmount={totalAmount}
          appliedCoupon={appliedCoupon}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Grand Total</Text>
          <Text style={styles.bottomAmount}>₹{totalAmount.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
          activeOpacity={0.8}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  scroll: {
    flex: 1,
    padding: Spacing.md,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  addAddressText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 6,
    gap: 10,
  },
  addressItemSelected: {
    backgroundColor: '#FFF8E1',
    borderColor: Colors.accent,
  },
  addressInfo: {
    flex: 1,
  },
  addrLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  addrLine: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  addrCity: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  noAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    borderStyle: 'dashed',
    gap: 8,
  },
  noAddressText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginTop: 8,
  },
  paymentRowSelected: {
    backgroundColor: '#FFF8E1',
    borderColor: Colors.accent,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  paymentName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  paymentDesc: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
  },
  bottomLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  bottomAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  placeOrderBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

