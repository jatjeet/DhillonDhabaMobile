import { apiClient, getDemoMode } from './client';
import { CartResponseDto, CreateCartItemDto, UpdateCartItemDto } from '../types';

export const cartApi = {
  async getCart(): Promise<CartResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      // In demo mode, the in-memory CartContext handles state directly
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

  async applyCoupon(code: string): Promise<CartResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      return { cartId: 1, items: [], itemCount: 1, itemTotal: 0, appliedCouponCode: code };
    }
    const res = await apiClient.post<CartResponseDto>('/v1/cart/coupon', { code });
    return res.data;
  },

  async removeCoupon(): Promise<CartResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      return { cartId: 1, items: [], itemCount: 1, itemTotal: 0, appliedCouponCode: null };
    }
    const res = await apiClient.delete<CartResponseDto>('/v1/cart/coupon');
    return res.data;
  },
};

