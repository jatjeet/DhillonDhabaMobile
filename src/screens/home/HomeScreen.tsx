import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Header } from '../../components/Header';
import { DishCard } from '../../components/DishCard';
import { CustomizerModal } from '../../components/CustomizerModal';
import { useDhaba } from '../../context/DhabaContext';
import { useCart } from '../../context/CartContext';
import { menuApi } from '../../api/menuApi';
import { outletApi } from '../../api/outletApi';
import { CategoryWithItemsDto, MenuItemSummaryDto, PagedReviewsDto } from '../../types';

export const HomeScreen = ({ navigation }: any) => {
  const { outlet, outletStatus, refreshDhabaData, isLoading: isDhabaLoading } = useDhaba();
  const { itemCount, itemTotal } = useCart();

  const [categories, setCategories] = useState<CategoryWithItemsDto[]>([]);
  const [reviewsData, setReviewsData] = useState<PagedReviewsDto | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isMenuLoading, setIsMenuLoading] = useState<boolean>(true);
  const [customizingItem, setCustomizingItem] = useState<MenuItemSummaryDto | null>(null);

  useEffect(() => {
    loadHomeData();
  }, [outlet]);

  const loadHomeData = async () => {
    if (!outlet) return;
    try {
      setIsMenuLoading(true);
      const [menu, reviews] = await Promise.all([
        menuApi.getFullMenu(outlet.id),
        outletApi.getReviews(outlet.id, 1, 3),
      ]);
      setCategories(menu);
      setReviewsData(reviews);
    } catch (err) {
      console.warn('Failed to load home data', err);
    } finally {
      setIsMenuLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshDhabaData(), loadHomeData()]);
    setRefreshing(false);
  };

  // Dynamically collect bestseller / signature items with fallback
  const bestsellers = useMemo(() => {
    const tagged = categories
      .flatMap(c => c.items)
      .filter(
        i =>
          i.tags &&
          i.tags.some(t =>
            ['bestseller', 'signature dish', 'must try', 'chef special'].includes(t.toLowerCase())
          )
      );
    if (tagged.length > 0) return tagged;
    return categories.flatMap(c => c.items);
  }, [categories]);

  // Helper to dynamically get category emoji and label
  const getCategoryDisplay = (name: string) => {
    const emojiMatch = name.match(/^(\p{Emoji}|\p{Extended_Pictographic})/u);
    if (emojiMatch) {
      return {
        emoji: emojiMatch[0],
        displayName: name.replace(/^(\p{Emoji}|\p{Extended_Pictographic})\s*/u, '').trim(),
      };
    }
    const lower = name.toLowerCase();
    let emoji = '🍲';
    if (lower.includes('starter') || lower.includes('tikka') || lower.includes('snack')) emoji = '🍢';
    else if (lower.includes('main') || lower.includes('curry') || lower.includes('gravy')) emoji = '🍛';
    else if (lower.includes('bread') || lower.includes('naan') || lower.includes('roti')) emoji = '🫓';
    else if (lower.includes('rice') || lower.includes('biryani')) emoji = '🍚';
    else if (lower.includes('beverage') || lower.includes('drink') || lower.includes('lassi')) emoji = '🥤';
    else if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('kheer')) emoji = '🍨';
    else if (lower.includes('tandoor')) emoji = '🔥';
    return { emoji, displayName: name };
  };

  if ((isDhabaLoading || isMenuLoading) && categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching live menu & dhaba details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onAddressPress={() => navigation.navigate('Profile', { screen: 'AddressManager' })} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Dynamic Hero Promo Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>PUNJABI HERITAGE</Text>
            </View>
            <Text style={styles.bannerTitle}>{outlet?.name || 'Dhillon Punjabi Dhaba'}</Text>
            <Text style={styles.bannerSubtitle} numberOfLines={2}>
              {outlet?.address
                ? `${outlet.address}, ${outlet.city}`
                : bestsellers.length > 0
                ? `Clay Tandoor • ${bestsellers.slice(0, 3).map(b => b.name).join(' • ')}`
                : 'Slow cooked 24-hr Dal Makhani, Chur Chur Naan & Butter Chicken'}
            </Text>

            <TouchableOpacity
              style={styles.bannerCta}
              onPress={() => navigation.navigate('Menu')}
              activeOpacity={0.8}
            >
              <Text style={styles.bannerCtaText}>Explore Full Menu</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Dhaba Trust Badges */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="star" size={18} color="#FFB300" />
            <Text style={styles.statValue}>
              {reviewsData?.summary?.averageRating
                ? `${reviewsData.summary.averageRating.toFixed(1)} / 5.0`
                : '5.0 / 5.0'}
            </Text>
            <Text style={styles.statLabel}>
              {reviewsData?.summary?.totalReviews
                ? `${reviewsData.summary.totalReviews}+ Highway Reviews`
                : 'Verified Kitchen'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <Text style={styles.statValue}>
              {outletStatus?.estimatedWaitMinutes ? `${outletStatus.estimatedWaitMinutes} Mins` : '30 Mins'}
            </Text>
            <Text style={styles.statLabel}>
              {outletStatus?.isOpen ? 'Fresh Tandoor Time' : 'Kitchen Closed'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="bicycle" size={18} color={Colors.primary} />
            <Text style={styles.statValue}>
              {outlet?.deliveryRadiusKm ? `${outlet.deliveryRadiusKm} Km` : '5 Km'}
            </Text>
            <Text style={styles.statLabel}>Delivery Radius</Text>
          </View>
        </View>

        {/* Quick Category Icons */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map(cat => {
            const { emoji, displayName } = getCategoryDisplay(cat.name);
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Menu', { selectedCategoryId: cat.id })}
                activeOpacity={0.7}
              >
                <View style={styles.categoryIconWrap}>
                  <Text style={styles.categoryEmoji}>{emoji}</Text>
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {displayName}
                </Text>
                <Text style={styles.categoryCount}>{cat.items.length} items</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Bestsellers Section */}
        {bestsellers.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Dhabe De Bestsellers</Text>
                <Text style={styles.sectionSubtitle}>Most loved recipes on the GT Road</Text>
              </View>
            </View>

            <View style={styles.dishList}>
              {bestsellers.slice(0, 4).map(item => (
                <DishCard
                  key={item.id}
                  item={item}
                  onCustomize={target => setCustomizingItem(target)}
                />
              ))}
            </View>
          </>
        )}

        {/* Reviews Highlight */}
        {reviewsData && reviewsData.reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>What Customers Say</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFF" />
                <Text style={styles.ratingText}>
                  {reviewsData.summary.averageRating?.toFixed(1) || '4.8'}
                </Text>
              </View>
            </View>

            {reviewsData.reviews.slice(0, 2).map(r => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{r.reviewerName}</Text>
                  <View style={styles.reviewStars}>
                    {[...Array(r.rating)].map((_, i) => (
                      <Ionicons key={i} name="star" size={13} color="#FFB300" />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewComment}>"{r.comment}"</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: itemCount > 0 ? 90 : 30 }} />
      </ScrollView>

      {/* Floating Cart Bar */}
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

      {/* Dish Customizer Modal */}
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
  scroll: {
    flex: 1,
  },
  bannerContainer: {
    margin: Spacing.md,
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1C1C1E',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  bannerTag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bannerTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: 0.8,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#FFE082',
    lineHeight: 16,
    marginBottom: 10,
    maxWidth: '85%',
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    gap: 6,
  },
  bannerCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  categoriesScroll: {
    paddingLeft: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginRight: 10,
    width: 105,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 15,
  },
  categoryCount: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dishList: {
    paddingHorizontal: Spacing.md,
  },
  reviewsSection: {
    marginTop: Spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.badgeOpen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
