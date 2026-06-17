import { apiClient } from '@/lib/api-client';

export const storeProductService = {
  async list(storeId: string, params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get(`/stores/${storeId}/products`, { params });
    return data;
  },
  async get(storeId: string, storeProductId: string) {
    const { data } = await apiClient.get(`/stores/${storeId}/products/${storeProductId}`);
    return data;
  },
  async add(storeId: string, body: { refacilProductId: number; markupCents?: number; customName?: string; customDescription?: string }) {
    const { data } = await apiClient.post(`/stores/${storeId}/products`, body);
    return data;
  },
  async update(storeId: string, storeProductId: string, body: { markupCents?: number; customName?: string; customDescription?: string }) {
    const { data } = await apiClient.patch(`/stores/${storeId}/products/${storeProductId}`, body);
    return data;
  },
  async remove(storeId: string, storeProductId: string) {
    const { data } = await apiClient.delete(`/stores/${storeId}/products/${storeProductId}`);
    return data;
  },
};
