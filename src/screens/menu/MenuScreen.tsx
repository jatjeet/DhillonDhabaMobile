import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { Header } from '../../components/Header';
import { DishCard } from '../../components/DishCard';
import { CustomizerModal } from '../../components/CustomizerModal';
import { useDhaba } from '../../context/DhabaContext';
import { useCart } from '../../context/CartContext';
import { menuApi } from '../../api/menuApi';
import { CategoryWithItemsDto, MenuItemSummaryDto } from '../../types';

export const MenuScreen = ({ route, navigation }: any) => {
  const { outlet } = useDhaba();
  const { itemCount, itemTotal } = useCart();
  const initialCategoryId = route?.params?.selectedCategoryId;

  const [categories, setCategories] = useState<CategoryWithItemsDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategoryId || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [customizingItem, setCustomizingItem] = useState<MenuItemSummaryDto | null>(null);

  useEffect(() => {
    if (outlet) {
      menuApi.getFullMenu(outlet.id).then(cats => {
        setCategories(cats);
        if (!selectedCategory && cats.length > 0) {
          setSelectedCategory(cats[0].id);
        }
      });
    }
  }, [outlet]);

  const filteredCategories = useMemo(() => {
    return categories
      .map(cat => {
        const filteredItems = cat.items.filter(item => {
          // Search query match
          const matchesQuery =
            !searchQuery ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

          // Veg / Non-Veg filter match
          const matchesVeg =
            filterType === 'all' ||
            (filterType === 'veg' && item.isVeg) ||
            (filterType === 'nonveg' && !item.isVeg);

          return matchesQuery && matchesVeg;
        });

        return {
          ...cat,
          items: filteredItems,
        };
      })
      .filter(cat => cat.items.length > 0);
  }, [categories, searchQuery, filterType]);

  return (
    <View style={styles.container}>
      <Header showAddress={false} />

      {/* Search and Filters Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Dal Makhani, Butter Chicken, Naan..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.vegFilterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filterType === 'all' && styles.filterPillActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
              All Dishes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filterType === 'veg' && { backgroundColor: '#E8F5E9', borderColor: Colors.veg },
            ]}
            onPress={() => setFilterType(filterType === 'veg' ? 'all' : 'veg')}
          >
            <View style={[styles.dot, { backgroundColor: Colors.veg }]} />
            <Text
              style={[
                styles.filterText,
                filterType === 'veg' && { color: Colors.veg, fontWeight: '700' },
              ]}
            >
              Pure Veg
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filterType === 'nonveg' && { backgroundColor: '#FFEBEE', borderColor: Colors.nonVeg },
            ]}
            onPress={() => setFilterType(filterType === 'nonveg' ? 'all' : 'nonveg')}
          >
            <View style={[styles.dot, { backgroundColor: Colors.nonVeg }]} />
            <Text
              style={[
                styles.filterText,
                filterType === 'nonveg' && { color: Colors.nonVeg, fontWeight: '700' },
              ]}
            >
              Non-Veg
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills Slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryPillsScroll}
        contentContainerStyle={{ paddingHorizontal: Spacing.md }}
      >
        <TouchableOpacity
          style={[styles.categoryTab, !selectedCategory && styles.categoryTabActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryTabText, !selectedCategory && styles.categoryTabTextActive]}>
            All Categories
          </Text>
        </TouchableOpacity>

        {categories.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTab, isActive && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Grouped Dishes List */}
      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
        {filteredCategories
          .filter(cat => !selectedCategory || cat.id === selectedCategory)
          .map(cat => (
            <View key={cat.id} style={styles.catGroup}>
              <View style={styles.catGroupHeader}>
                <Text style={styles.catGroupTitle}>{cat.name}</Text>
                <Text style={styles.catGroupCount}>{cat.items.length} items</Text>
              </View>

              {cat.items.map(item => (
                <DishCard
                  key={item.id}
                  item={item}
                  onCustomize={target => setCustomizingItem(target)}
                />
              ))}
            </View>
          ))}

        {filteredCategories.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No dishes found</Text>
            <Text style={styles.emptySubtitle}>Try searching with different keywords or filters.</Text>
          </View>
        )}

        <View style={{ height: itemCount > 0 ? 90 : 30 }} />
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.floatingCartBar}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.cartCountText}>
                {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
              </Text>
              <Text style={styles.cartTotalText}>₹{itemTotal.toFixed(2)} plus taxes</Text>
            </View>

            <View style={styles.viewCartWrap}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Customizer Modal */}
      <CustomizerModal
        visible={!!customizingItem}
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  vegFilterRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: '#1C1C1E',
    borderColor: '#1C1C1E',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryPillsScroll: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    maxHeight: 46,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  menuScroll: {
    flex: 1,
    padding: Spacing.md,
  },
  catGroup: {
    marginBottom: Spacing.lg,
  },
  catGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  catGroupTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  catGroupCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  floatingCartBar: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  cartCountText: {
    color: '#FFE082',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cartTotalText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  viewCartWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

