import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';
import { orderApi } from '../api/orderApi';

interface ReviewModalProps {
  visible: boolean;
  orderId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  orderId,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [foodRating, setFoodRating] = useState<number>(5);
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!orderId) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await orderApi.submitReview(orderId, {
        rating,
        foodRating,
        deliveryRating,
        comment: comment.trim() || undefined,
      });
      Alert.alert('Review Submitted', 'Thank you for your feedback! It helps us keep our dhaba flavours authentic.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (current: number, onSelect: (val: number) => void) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => onSelect(star)} activeOpacity={0.7}>
            <Ionicons
              name={star <= current ? 'star' : 'star-outline'}
              size={28}
              color={Colors.accent}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Rate Your Dhaba Feast</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.rateBlock}>
              <Text style={styles.rateLabel}>Overall Experience</Text>
              {renderStars(rating, setRating)}
            </View>

            <View style={styles.rateBlock}>
              <Text style={styles.rateLabel}>Food Taste & Freshness</Text>
              {renderStars(foodRating, setFoodRating)}
            </View>

            <View style={styles.rateBlock}>
              <Text style={styles.rateLabel}>Delivery & Packaging</Text>
              {renderStars(deliveryRating, setDeliveryRating)}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Tell us what you loved about the Dal Makhani, Tandoori Roti or delivery..."
              placeholderTextColor={Colors.textLight}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: Spacing.md,
  },
  rateBlock: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 13,
    color: Colors.text,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
    height: 80,
    marginBottom: Spacing.md,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

