import { apiClient, getDemoMode } from './client';
import { OutletResponseDto, OutletStatusDto, PagedReviewsDto } from '../types';
import { mockOutlet, mockOutletStatus, mockReviews } from './mockData';

export const outletApi = {
  async getAll(): Promise<OutletResponseDto[]> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 200));
      return [mockOutlet];
    }
    const res = await apiClient.get<OutletResponseDto[]>('/v1/outlets');
    return res.data;
  },

  async getById(id: number): Promise<OutletResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 150));
      return mockOutlet;
    }
    const res = await apiClient.get<OutletResponseDto>(`/v1/outlets/${id}`);
    return res.data;
  },

  async getStatus(id: number): Promise<OutletStatusDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 150));
      return mockOutletStatus;
    }
    const res = await apiClient.get<OutletStatusDto>(`/v1/outlets/${id}/status`);
    return res.data;
  },

  async getReviews(id: number, page: number = 1, pageSize: number = 10): Promise<PagedReviewsDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 250));
      return mockReviews;
    }
    const res = await apiClient.get<PagedReviewsDto>(`/v1/outlets/${id}/reviews`, {
      params: { page, pageSize },
    });
    return res.data;
  },
};

