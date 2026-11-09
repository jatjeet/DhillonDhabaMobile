import { apiClient, getDemoMode } from './client';
import { CartResponseDto, CreateCartItemDto, UpdateCartItemDto, CartSummaryDto } from '../types';

export const cartApi = {
  async getCart(): Promise<CartResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      return {
        cartId: 1,
        outletId: 1,
        items: [],
        itemCount: 0,
        itemTotal: 0,
      };
    }
    const res = await apiClient.get<CartResponseDto>('/v1/cart');
    return res.data;
  },

  async addItem(dto: CreateCartItemDto): Promise<CartResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      return { cartId: 1, items: [], itemCount: 1, itemTotal: 0 };
    }
    const res = await apiClient.post<CartResponseDto>('/v1/cart/items', dto);
    return res.data;
  },

  async updateItem(cartItemId: number, dto: UpdateCartItemDto): Promise<CartResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      return { cartId: 1, items: [], itemCount: 1, itemTotal: 0 };
    }
    const res = await apiClient.patch<CartResponseDto>(`/v1/cart/items/${cartItemId}`, dto);
    return res.data;
  },

  async removeItem(cartItemId: number): Promise<CartResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      return { cartId: 1, items: [], itemCount: 0, itemTotal: 0 };
    }
    const res = await apiClient.delete<CartResponseDto>(`/v1/cart/items/${cartItemId}`);
    return res.data;
  },

  async clearCart(): Promise<void> {
    const isDemo = await getDemoMode();
    if (isDemo) return;
    await apiClient.delete('/v1/cart');
  },

  async applyCoupon(code: string): Promise<CartSummaryDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      return {
        itemTotal: 0,
        deliveryFee: 0,
        packagingFee: 0,
        taxes: 0,
        discountAmount: 50,
        totalAmount: 0,
        appliedCouponCode: code,
      };
    }
    const res = await apiClient.post<CartSummaryDto>('/v1/cart/apply-coupon', { code });
    return res.data;
  },

  async getSummary(): Promise<CartSummaryDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      return {
        itemTotal: 0,
        deliveryFee: 40,
        packagingFee: 20,
        taxes: 0,
        discountAmount: 0,
        totalAmount: 60,
      };
    }
    const res = await apiClient.get<CartSummaryDto>('/v1/cart/summary');
    return res.data;
  },
};

