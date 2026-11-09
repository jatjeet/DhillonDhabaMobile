// TypeScript types mirroring ASP.NET Core DTOs for Dhillon Dhaba

export interface UserDto {
  id: number;
  phone: string;
  name?: string | null;
  email?: string | null;
  role: string;
  profileComplete: boolean;
}

export interface OtpRequestDto {
  phone: string;
  deviceId: string;
}

export interface OtpRequestResponseDto {
  success: boolean;
  message: string;
  expiresInSeconds: number;
  retryAfterSeconds: number;
}

export interface OtpVerifyDto {
  phone: string;
  otp: string;
  deviceId: string;
  platform: 'android' | 'ios' | 'web';
  fcmToken?: string | null;
}

export interface OtpVerifyResponseDto {
  success: boolean;
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

export interface VariantDto {
  id: number;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface AddonOptionDto {
  id: number;
  name: string;
  priceDelta: number;
}

export interface AddonGroupDto {
  id: number;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: AddonOptionDto[];
}

export interface MenuItemSummaryDto {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isVeg: boolean;
  spiceLevel: 'mild' | 'medium' | 'spicy' | string;
  basePrice: number;
  tags: string[];
  variants: VariantDto[];
  addonGroups: AddonGroupDto[];
}

export interface CategoryWithItemsDto {
  id: number;
  name: string;
  sortOrder: number;
  items: MenuItemSummaryDto[];
}

export interface MenuItemDetailDto extends MenuItemSummaryDto {
  categoryId: number;
  categoryName: string;
  isAvailable: boolean;
}

export interface CartAddonLineDto {
  id: number;
  name: string;
  priceDelta: number;
}

export interface CartItemResponseDto {
  id: number;
  itemId: number;
  itemName: string;
  itemImageUrl?: string | null;
  variantId?: number | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  addons: CartAddonLineDto[];
  lineTotal: number;
  itemNote?: string | null;
}

export interface CartResponseDto {
  cartId: number;
  outletId?: number | null;
  items: CartItemResponseDto[];
  itemCount: number;
  itemTotal: number;
  appliedCouponCode?: string | null;
}

export interface CreateCartItemDto {
  itemId: number;
  variantId?: number | null;
  quantity: number;
  addons: number[];
  itemNote?: string | null;
}

export interface UpdateCartItemDto {
  quantity?: number;
  addons?: number[];
  itemNote?: string | null;
}

export interface CartSummaryDto {
  itemTotal: number;
  deliveryFee: number;
  packagingFee: number;
  taxes: number;
  discountAmount: number;
  totalAmount: number;
  appliedCouponCode?: string | null;
  couponMessage?: string | null;
}

export interface AddressResponseDto {
  id: number;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

export interface CreateAddressDto {
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  label?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
}

export interface OutletResponseDto {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  opensAt: string;
  closesAt: string;
  isDeliveryEnabled: boolean;
  isPickupEnabled: boolean;
  deliveryRadiusKm: number;
  status: string;
}

export interface OutletStatusDto {
  outletId: number;
  isOpen: boolean;
  reason: string;
  estimatedWaitMinutes?: number | null;
  opensAt: string;
  closesAt: string;
}

export interface OrderItemAddonSnapshotDto {
  id: number;
  name: string;
  priceDelta: number;
}

export interface OrderItemResponseDto {
  id: number;
  itemId: number;
  itemName: string;
  variantId?: number | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  addons: OrderItemAddonSnapshotDto[];
  subtotal: number;
}

export interface OrderStatusHistoryDto {
  status: string;
  changedAt: string;
  note?: string | null;
}

export interface OrderSummaryDto {
  id: number;
  orderNumber: string;
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | string;
  orderType: 'delivery' | 'pickup' | string;
  itemCount: number;
  totalAmount: number;
  placedAt: string;
}

export interface OrderDetailDto {
  id: number;
  orderNumber: string;
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | string;
  orderType: 'delivery' | 'pickup' | string;
  outletId: number;
  items: OrderItemResponseDto[];
  itemTotal: number;
  deliveryFee: number;
  packagingFee: number;
  discountAmount: number;
  taxes: number;
  totalAmount: number;
  appliedCouponCode?: string | null;
  paymentMethod: 'cod' | 'online' | string;
  paymentStatus: 'pending' | 'success' | 'failed' | string;
  deliveryAddressLine1?: string | null;
  deliveryAddressLine2?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryPincode?: string | null;
  specialInstructions?: string | null;
  placedAt: string;
  estimatedDeliveryTime?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  statusHistory: OrderStatusHistoryDto[];
}

export interface CreateOrderDto {
  orderType: 'delivery' | 'pickup';
  deliveryAddressId?: number | null;
  paymentMethod: 'cod' | 'online';
  specialInstructions?: string | null;
}

export interface CreatePaymentIntentDto {
  orderId: number;
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
}

export interface PaymentIntentResponseDto {
  paymentId: number;
  providerOrderId: string;
  provider: string;
  amount: number;
  currency: string;
  clientCheckoutData: Record<string, string>;
}

export interface CreateReviewDto {
  rating: number;
  foodRating?: number | null;
  deliveryRating?: number | null;
  comment?: string | null;
}

export interface ReviewResponseDto {
  id: number;
  orderId: number;
  reviewerName: string;
  rating: number;
  foodRating?: number | null;
  deliveryRating?: number | null;
  comment?: string | null;
  createdAt: string;
}

export interface OutletRatingSummaryDto {
  averageRating?: number | null;
  averageFoodRating?: number | null;
  averageDeliveryRating?: number | null;
  totalReviews: number;
}

export interface PagedReviewsDto {
  summary: OutletRatingSummaryDto;
  reviews: ReviewResponseDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

