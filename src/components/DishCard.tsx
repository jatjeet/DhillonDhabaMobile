import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItemSummaryDto } from '../types';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { VegBadge } from './VegBadge';
import { SpiceBadge } from './SpiceBadge';
import { useCart } from '../context/CartContext';

interface DishCardProps {
  item: MenuItemSummaryDto;
  onCustomize: (item: MenuItemSummaryDto) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ item, onCustomize }) => {
  const { items, addItem, updateQuantity } = useCart();

  const isCustomizable = item.variants.length > 1 || item.addonGroups.length > 0;

  // Find all cart entries for this item
  const matchingCartItems = items.filter(ci => ci.itemId === item.id);
  const totalQty = matchingCartItems.reduce((sum, ci) => sum + ci.quantity, 0);

  const handleAddPress = () => {
    if (isCustomizable) {
      onCustomize(item);
    } else {
      addItem(item);
    }
  };

  const handleIncrement = () => {
    if (isCustomizable) {
      onCustomize(item);
    } else if (matchingCartItems.length > 0) {
      updateQuantity(matchingCartItems[0].id, 1);
    }
  };

  const handleDecrement = () => {
    if (matchingCartItems.length > 0) {
      updateQuantity(matchingCartItems[matchingCartItems.length - 1].id, -1);
    }
  };

  const defaultVariant = item.variants.find(v => v.isDefault) || item.variants[0];
  const displayPrice = defaultVariant ? defaultVariant.price : item.basePrice;

  return (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <View style={styles.badgeRow}>
          <VegBadge isVeg={item.isVeg} size={15} />
          {item.spiceLevel && <SpiceBadge spiceLevel={item.spiceLevel} />}
          {item.tags?.includes('Bestseller') && (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>★ BESTSELLER</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>₹{displayPrice}</Text>

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {isCustomizable && (
          <Text style={styles.customizableNote}>Customisable with variants & sides</Text>
        )}
      </View>

      <View style={styles.imageActionContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="restaurant-outline" size={32} color={Colors.textLight} />
          </View>
        )}

        <View style={styles.actionButtonWrapper}>
          {totalQty === 0 ? (
            <TouchableOpacity style={styles.addButton} onPress={handleAddPress} activeOpacity={0.8}>
              <Text style={styles.addButtonText}>ADD</Text>
              {isCustomizable && <Text style={styles.plusSign}>+</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyContainer}>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
                <Ionicons name="remove" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{totalQty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrement}>
                <Ionicons name="add" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bestsellerBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bestsellerText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  customizableNote: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  imageActionContainer: {
    width: 110,
    alignItems: 'center',
  },
  image: {
    width: 105,
    height: 95,
    borderRadius: BorderRadius.md,
  },
  placeholderImage: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonWrapper: {
    marginTop: -16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.primary,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  plusSign: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
  },
  qtyBtn: {
    padding: 2,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    minWidth: 16,
    textAlign: 'center',
  },
});

