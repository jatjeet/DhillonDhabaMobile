import { apiClient, getDemoMode } from './client';
import { CategoryWithItemsDto, MenuItemDetailDto } from '../types';
import { mockMenuCategories } from './mockData';

export const menuApi = {
  async getFullMenu(outletId: number): Promise<CategoryWithItemsDto[]> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 200));
      return mockMenuCategories;
    }
    const res = await apiClient.get<CategoryWithItemsDto[]>(`/v1/outlets/${outletId}/menu`);
    return res.data;
  },

  async getItemDetail(outletId: number, itemId: number): Promise<MenuItemDetailDto | null> {
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 150));
      for (const cat of mockMenuCategories) {
        const item = cat.items.find(i => i.id === itemId);
        if (item) {
          return {
            ...item,
            categoryId: cat.id,
            categoryName: cat.name,
            isAvailable: true,
          };
        }
      }
      return null;
    }

    const res = await apiClient.get<MenuItemDetailDto>(`/v1/outlets/${outletId}/menu/items/${itemId}`);
    return res.data;
  },
};

