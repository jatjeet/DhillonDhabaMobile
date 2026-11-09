import { apiClient, getDemoMode } from './client';
import { AddressResponseDto, CreateAddressDto, UpdateAddressDto, UserDto } from '../types';
import { mockAddresses, mockUser } from './mockData';

let localAddresses = [...mockAddresses];

export const meApi = {
  async getMe(): Promise<UserDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 150));
      return mockUser;
    }
    const res = await apiClient.get<UserDto>('/v1/me');
    return res.data;
  },

  async updateMe(dto: { name?: string; email?: string }): Promise<UserDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 200));
      return { ...mockUser, ...dto };
    }
    const res = await apiClient.patch<UserDto>('/v1/me', dto);
    return res.data;
  },

  async getAddresses(): Promise<AddressResponseDto[]> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 150));
      return [...localAddresses];
    }
    const res = await apiClient.get<AddressResponseDto[]>('/v1/me/addresses');
    return res.data;
  },

  async createAddress(dto: CreateAddressDto): Promise<AddressResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 250));
      const newAddr: AddressResponseDto = {
        id: Math.floor(Math.random() * 1000) + 10,
        ...dto,
        isDefault: dto.isDefault ?? false,
      };
      if (newAddr.isDefault) {
        localAddresses = localAddresses.map(a => ({ ...a, isDefault: false }));
      }
      localAddresses.push(newAddr);
      return newAddr;
    }
    const res = await apiClient.post<AddressResponseDto>('/v1/me/addresses', dto);
    return res.data;
  },

  async updateAddress(id: number, dto: UpdateAddressDto): Promise<AddressResponseDto> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 200));
      localAddresses = localAddresses.map(a => (a.id === id ? { ...a, ...dto } : a));
      return localAddresses.find(a => a.id === id)!;
    }
    const res = await apiClient.patch<AddressResponseDto>(`/v1/me/addresses/${id}`, dto);
    return res.data;
  },

  async deleteAddress(id: number): Promise<void> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 200));
      localAddresses = localAddresses.filter(a => a.id !== id);
      return;
    }
    await apiClient.delete(`/v1/me/addresses/${id}`);
  },

  async setDefaultAddress(id: number): Promise<void> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 150));
      localAddresses = localAddresses.map(a => ({ ...a, isDefault: a.id === id }));
      return;
    }
    await apiClient.post(`/v1/me/addresses/${id}/default`);
  },
};

