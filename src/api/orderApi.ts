import { apiClient, getDemoMode } from './client';
import {
  CreateOrderDto,
  OrderDetailDto,
  OrderSummaryDto,
  CreateReviewDto,
  ReviewResponseDto,
  CreatePaymentIntentDto,
  PaymentIntentResponseDto,
} from '../types';
import { mockActiveOrder, mockPastOrders } from './mockData';

export const orderApi = {
  async createOrder(dto: CreateOrderDto): Promise<OrderDetailDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 600));
      const newOrder: OrderDetailDto = {
        ...mockActiveOrder,
        id: Math.floor(Math.random() * 900) + 100,
        orderNumber: `DHL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 90) + 10}`,
        orderType: dto.orderType,
        paymentMethod: dto.paymentMethod,
        paymentStatus: dto.paymentMethod === 'cod' ? 'pending' : 'success',
        specialInstructions: dto.specialInstructions || null,
        placedAt: new Date().toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: 'placed',
        statusHistory: [
          { status: 'placed', changedAt: new Date().toISOString(), note: 'Order placed by customer' },
        ],
      };
      return newOrder;
    }

    const res = await apiClient.post<OrderDetailDto>('/v1/orders', dto);
    return res.data;
  },

  async getHistory(page: number = 1, pageSize: number = 10): Promise<{ orders: OrderSummaryDto[]; totalCount: number }> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 300));
      const all = [mockActiveOrder, ...mockPastOrders];
      return {
        orders: all.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          orderType: o.orderType,
          itemCount: o.items.reduce((acc, it) => acc + it.quantity, 0),
          totalAmount: o.totalAmount,
          placedAt: o.placedAt,
        })),
        totalCount: all.length,
      };
    }

    const res = await apiClient.get<any>('/v1/orders', {
      params: { page, pageSize },
    });
    const orders = res.data?.orders || res.data?.Orders || (Array.isArray(res.data) ? res.data : []);
    const totalCount = res.data?.totalCount ?? res.data?.TotalCount ?? orders.length;
    return { orders, totalCount };
  },

  async getById(id: number): Promise<OrderDetailDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 200));
      if (id === mockActiveOrder.id) return mockActiveOrder;
      const found = mockPastOrders.find(o => o.id === id);
      return found || mockActiveOrder;
    }

    const res = await apiClient.get<OrderDetailDto>(`/v1/orders/${id}`);
    return res.data;
  },

  async cancelOrder(id: number, reason: string): Promise<OrderDetailDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 300));
      return {
        ...mockActiveOrder,
        id,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason,
      };
    }

    const res = await apiClient.post<OrderDetailDto>(`/v1/orders/${id}/cancel`, { reason });
    return res.data;
  },

  async submitReview(id: number, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 400));
      return {
        id: Math.floor(Math.random() * 1000) + 1,
        orderId: id,
        reviewerName: 'Customer',
        rating: dto.rating,
        foodRating: dto.foodRating,
        deliveryRating: dto.deliveryRating,
        comment: dto.comment,
        createdAt: new Date().toISOString(),
      };
    }

    const res = await apiClient.post<ReviewResponseDto>(`/v1/orders/${id}/review`, dto);
    return res.data;
  },

  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 400));
      return {
        paymentId: 999,
        providerOrderId: `fake_pay_${Date.now()}`,
        provider: 'fake',
        amount: 500,
        currency: 'INR',
        clientCheckoutData: { note: 'Demo payment simulated successfully' },
      };
    }

    const res = await apiClient.post<PaymentIntentResponseDto>('/v1/payments/create-intent', dto);
    return res.data;
  },
};

