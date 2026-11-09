import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

interface StepTrackerProps {
  currentStatus: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | string;
}

const STEPS = [
  { key: 'placed', label: 'Placed', icon: 'receipt-outline' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
  { key: 'preparing', label: 'In Tandoor', icon: 'flame-outline' },
  { key: 'out_for_delivery', label: 'On The Way', icon: 'bicycle-outline' },
  { key: 'delivered', label: 'Delivered', icon: 'home-outline' },
];

export const StepTracker: React.FC<StepTrackerProps> = ({ currentStatus }) => {
  if (currentStatus === 'cancelled') {
    return (
      <View style={styles.cancelledBanner}>
        <Ionicons name="close-circle" size={24} color={Colors.badgeClosed} />
        <View style={styles.cancelledTextWrap}>
          <Text style={styles.cancelledTitle}>Order Cancelled</Text>
          <Text style={styles.cancelledSubtitle}>This order was cancelled.</Text>
        </View>
      </View>
    );
  }

  const currentIndex = STEPS.findIndex(s => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <React.Fragment key={step.key}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.iconCircle,
                    isDone && styles.circleDone,
                    isCurrent && styles.circleCurrent,
                    isPending && styles.circlePending,
                  ]}
                >
                  <Ionicons
                    name={isDone ? 'checkmark' : (step.icon as any)}
                    size={16}
                    color={isPending ? Colors.textLight : '#FFFFFF'}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelCurrent,
                    isDone && styles.stepLabelDone,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>

              {idx < STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    idx < activeIndex ? styles.lineDone : styles.linePending,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 54,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  circleDone: {
    backgroundColor: Colors.badgeOpen,
  },
  circleCurrent: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  circlePending: {
    backgroundColor: '#F0F0F0',
  },
  stepLine: {
    flex: 1,
    height: 3,
    marginBottom: 16,
    marginHorizontal: -4,
  },
  lineDone: {
    backgroundColor: Colors.badgeOpen,
  },
  linePending: {
    backgroundColor: '#EEEEEE',
  },
  stepLabel: {
    fontSize: 9.5,
    color: Colors.textLight,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    fontWeight: '700',
    color: Colors.primary,
  },
  stepLabelDone: {
    fontWeight: '600',
    color: Colors.text,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 12,
  },
  cancelledTextWrap: {
    flex: 1,
  },
  cancelledTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.badgeClosed,
  },
  cancelledSubtitle: {
    fontSize: 12,
    color: Colors.badgeClosed,
  },
});

