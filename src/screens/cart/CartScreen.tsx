import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { BillBreakdown } from '../../components/BillBreakdown';
import { useCart } from '../../context/CartContext';
import { useDhaba } from '../../context/DhabaContext';
import { useAuth } from '../../context/AuthContext';
import { availableCoupons } from '../../api/mockData';

export const CartScreen = ({ navigation }: any) => {
  const {
    items,
    itemCount,
    itemTotal,
    deliveryFee,
    packagingFee,
    taxes,
    discountAmount,
    totalAmount,
    appliedCoupon,
    orderType,
    specialInstructions,
    setOrderType,
    setSpecialInstructions,
    updateQuantity,
    removeItem,
    applyCouponCode,
    removeCouponCode,
  } = useCart();

  const { selectedAddress } = useDhaba();
  const { isAuthenticated } = useAuth();
  const [couponInput, setCouponInput] = useState<string>('');

  const handleApplyCoupon = (code?: string) => {
    const targetCode = code || couponInput;
    if (!targetCode) return;
    const res = applyCouponCode(targetCode);
    if (res.success) {
      setCouponInput('');
      Alert.alert('Success', res.message);
    } else {
      Alert.alert('Coupon Alert', res.message);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    navigation.navigate('Checkout');
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCircle}>
          <Ionicons name="cart-outline" size={54} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Your Dhaba Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Add authentic clay tandoor starters, slow-cooked Dal Makhani or Patiala Lassi!
        </Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => navigation.navigate('Menu')}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreBtnText}>Browse Dhaba Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dhaba Cart ({itemCount})</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Delivery / Pickup Switcher */}
        <View style={styles.typeSwitcher}>
          <TouchableOpacity
            style={[styles.typeBtn, orderType === 'delivery' && styles.typeBtnActive]}
            onPress={() => setOrderType('delivery')}
          >
            <Ionicons
              name="bicycle"
              size={18}
              color={orderType === 'delivery' ? '#FFFFFF' : Colors.textMuted}
            />
            <Text style={[styles.typeBtnText, orderType === 'delivery' && styles.typeBtnTextActive]}>
              Doorstep Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, orderType === 'pickup' && styles.typeBtnActive]}
            onPress={() => setOrderType('pickup')}
          >
            <Ionicons
              name="walk"
              size={18}
              color={orderType === 'pickup' ? '#FFFFFF' : Colors.textMuted}
            />
            <Text style={[styles.typeBtnText, orderType === 'pickup' && styles.typeBtnTextActive]}>
              Dhaba Takeaway
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected Address Card (for Delivery) */}
        {orderType === 'delivery' && (
          <TouchableOpacity
            style={styles.addressCard}
            onPress={() => navigation.navigate('Profile', { screen: 'AddressManager' })}
          >
            <Ionicons name="location" size={20} color={Colors.primary} />
            <View style={styles.addressTextWrap}>
              <Text style={styles.addressLabel}>
                Delivering to: <Text style={styles.addressBold}>{selectedAddress?.label || 'Select'}</Text>
              </Text>
              <Text style={styles.addressLine} numberOfLines={1}>
                {selectedAddress?.line1 || 'Tap to choose or add address'}
              </Text>
            </View>
            <Text style={styles.changeText}>CHANGE</Text>
          </TouchableOpacity>
        )}

        {/* Cart Items List */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Selected Dishes</Text>

          {items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                {item.variantName && (
                  <Text style={styles.variantTag}>Portion: {item.variantName}</Text>
                )}
                {item.addons.length > 0 && (
                  <Text style={styles.addonsTag}>
                    + {item.addons.map(a => a.name).join(', ')}
                  </Text>
                )}
                {item.itemNote ? (
                  <Text style={styles.noteTag}>Note: {item.itemNote}</Text>
                ) : null}
                <Text style={styles.itemPrice}>₹{item.lineTotal.toFixed(2)}</Text>
              </View>

              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Ionicons name="remove" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Ionicons name="add" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Cooking & Delivery Notes */}
        <View style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Ionicons name="document-text-outline" size={18} color={Colors.text} />
            <Text style={styles.notesTitle}>Special Instructions for Dhaba Kitchen</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="E.g., Please send extra vinegar onions and green chutney..."
            placeholderTextColor={Colors.textLight}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Coupons & Promo Codes */}
        <View style={styles.couponCard}>
          <Text style={styles.sectionTitle}>Offers & Discounts</Text>

          {appliedCoupon ? (
            <View style={styles.appliedRow}>
              <View style={styles.appliedInfo}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.badgeOpen} />
                <View>
                  <Text style={styles.appliedCode}>'{appliedCoupon}' Applied</Text>
                  <Text style={styles.appliedSaving}>You saved ₹{discountAmount.toFixed(2)}!</Text>
                </View>
              </View>
              <TouchableOpacity onPress={removeCouponCode}>
                <Text style={styles.removeText}>REMOVE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter Promo Code"
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="characters"
                  value={couponInput}
                  onChangeText={setCouponInput}
                />
                <TouchableOpacity
                  style={[styles.applyBtn, !couponInput && styles.applyBtnDisabled]}
                  onPress={() => handleApplyCoupon()}
                  disabled={!couponInput}
                >
                  <Text style={styles.applyBtnText}>APPLY</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Coupon Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickCoupons}>
                {availableCoupons.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={styles.couponPill}
                    onPress={() => handleApplyCoupon(c.code)}
                  >
                    <Text style={styles.couponPillCode}>{c.code}</Text>
                    <Text style={styles.couponPillDesc}>{c.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>

        {/* Bill Breakdown */}
        <BillBreakdown
          itemTotal={itemTotal}
          deliveryFee={deliveryFee}
          packagingFee={packagingFee}
          taxes={taxes}
          discountAmount={discountAmount}
          totalAmount={totalAmount}
          appliedCoupon={appliedCoupon}
        />

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky Bottom Checkout Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total to Pay</Text>
          <Text style={styles.bottomTotalAmount}>₹{totalAmount.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleProceedToCheckout}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutBtnText}>
            {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: Spacing.lg,
  },
  exploreBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 10,
  },
  addressTextWrap: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  addressBold: {
    fontWeight: '700',
    color: Colors.text,
  },
  addressLine: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemsCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  variantTag: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  addonsTag: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  noteTag: {
    fontSize: 11,
    color: '#F57C00',
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 4,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 8,
  },
  qtyBtn: {
    padding: 2,
  },
  qtyNum: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    minWidth: 16,
    textAlign: 'center',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    fontSize: 12,
    color: Colors.text,
    backgroundColor: '#FAFAFA',
  },
  couponCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    backgroundColor: '#FAFAFA',
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  quickCoupons: {
    marginTop: 4,
  },
  couponPill: {
    backgroundColor: '#FFF8E1',
    borderColor: Colors.accent,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  couponPillCode: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  couponPillDesc: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  appliedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: BorderRadius.sm,
  },
  appliedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appliedCode: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.badgeOpen,
  },
  appliedSaving: {
    fontSize: 11,
    color: Colors.badgeOpen,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.badgeClosed,
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
  bottomTotalLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  bottomTotalAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

