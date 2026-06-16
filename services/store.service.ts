import { apiClient } from '@/lib/api-client';

export const storeService = {
  async createStore(sellerId: string, storeData: Record<string, any>) {
    const { data } = await apiClient.post(`/sellers/${sellerId}/store`, storeData);
    return data;
  },

  async getMyStore(sellerId: string) {
    const { data } = await apiClient.get(`/sellers/${sellerId}/store`);
    return data;
  },

  async getStorePublic(storeIdOrSlug: string) {
    // Maneja id o slug según la convención del backend (se asume que slug es con /slug/...)
    // El backend dice: GET /stores/:storeId o GET /stores/slug/:slug
    const url = storeIdOrSlug.includes('-') 
      ? `/stores/slug/${storeIdOrSlug}` 
      : `/stores/${storeIdOrSlug}`;
    
    const { data } = await apiClient.get(url);
    return data;
  },

  async updateStore(sellerId: string, storeData: Record<string, any>) {
    const { data } = await apiClient.put(`/sellers/${sellerId}/store`, storeData);
    return data;
  },

  async updateVisibility(sellerId: string, visibility: string) {
    const { data } = await apiClient.patch(`/sellers/${sellerId}/store/visibility`, { visibility });
    return data;
  },

  async openStore(sellerId: string) {
    const { data } = await apiClient.patch(`/sellers/${sellerId}/store/open`);
    return data;
  },

  async closeStore(sellerId: string) {
    const { data } = await apiClient.patch(`/sellers/${sellerId}/store/close`);
    return data;
  },
};
