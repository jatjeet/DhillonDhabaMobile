import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { orderApi } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { ReviewModal } from '../../components/ReviewModal';
import { OrderSummaryDto } from '../../types';

export const OrdersScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [reviewOrderId, setReviewOrderId] = useState<number | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await orderApi.getHistory();
      setOrders(res.orders);
    } catch (err) {
      console.warn('Failed to load orders', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return Colors.badgeOpen;
      case 'cancelled':
        return Colors.badgeClosed;
      default:
        return Colors.badgePending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed':
        return 'Order Placed';
      case 'confirmed':
        return 'Accepted by Dhaba';
      case 'preparing':
        return 'Cooking in Tandoor';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item }: { item: OrderSummaryDto }) => {
    const isLive = ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(item.status);
    const isDelivered = item.status === 'delivered';
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.placedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.itemSummary}>
            {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'} • ₹{item.totalAmount.toFixed(2)}
          </Text>
          <Text style={styles.orderTypeTag}>
            {item.orderType === 'delivery' ? '🛵 Delivery' : '🥡 Takeaway'}
          </Text>
        </View>

        <View style={styles.cardActions}>
          {isLive ? (
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={16} color="#FFFFFF" />
              <Text style={styles.trackBtnText}>Live Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
            >
              <Text style={styles.viewDetailsText}>View Receipt</Text>
            </TouchableOpacity>
          )}

          {isDelivered && (
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => setReviewOrderId(item.id)}
            >
              <Ionicons name="star-outline" size={14} color={Colors.primary} />
              <Text style={styles.reviewBtnText}>Rate Meal</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={54} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Orders Placed Yet</Text>
            <Text style={styles.emptySubtitle}>
              When you order fresh Punjabi dhaba food, you can track it here!
            </Text>
          </View>
        }
      />

      <ReviewModal
        visible={!!reviewOrderId}
        orderId={reviewOrderId}
        onClose={() => setReviewOrderId(null)}
        onSuccess={loadOrders}
      />
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
  listContent: {
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  orderDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemSummary: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  orderTypeTag: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 10,
  },
  trackBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewDetailsBtn: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    padding: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});

