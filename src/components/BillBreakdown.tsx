import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';

interface BillBreakdownProps {
  itemTotal: number;
  deliveryFee: number;
  packagingFee: number;
  taxes: number;
  discountAmount: number;
  totalAmount: number;
  appliedCoupon?: string | null;
}

export const BillBreakdown: React.FC<BillBreakdownProps> = ({
  itemTotal,
  deliveryFee,
  packagingFee,
  taxes,
  discountAmount,
  totalAmount,
  appliedCoupon,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Bill Summary</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Item Total</Text>
        <Text style={styles.value}>₹{itemTotal.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Delivery Partner Fee</Text>
        {deliveryFee === 0 ? (
          <Text style={styles.freeText}>FREE</Text>
        ) : (
          <Text style={styles.value}>₹{deliveryFee.toFixed(2)}</Text>
        )}
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Packaging & Containers</Text>
        <Text style={styles.value}>₹{packagingFee.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Taxes & Charges (GST 5%)</Text>
        <Text style={styles.value}>₹{taxes.toFixed(2)}</Text>
      </View>

      {discountAmount > 0 && (
        <View style={styles.row}>
          <Text style={styles.discountLabel}>
            Coupon Discount {appliedCoupon ? `(${appliedCoupon})` : ''}
          </Text>
          <Text style={styles.discountValue}>-₹{discountAmount.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>To Pay</Text>
        <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  freeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.badgeOpen,
  },
  discountLabel: {
    fontSize: 13,
    color: Colors.badgeOpen,
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 13,
    color: Colors.badgeOpen,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
});

