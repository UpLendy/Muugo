import { apiClient } from '@/lib/api-client';

export const catalogService = {
  async getCategories(parentId?: number) {
    const { data } = await apiClient.get('/catalog/categories', { params: { parentId } });
    return data;
  },
  async getProducts(params?: { categoryId?: number; productType?: string; search?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/catalog/products', { params });
    return data;
  },
  async getProduct(id: number) {
    const { data } = await apiClient.get(`/catalog/products/${id}`);
    return data;
  },
  async syncCatalog() {
    const { data } = await apiClient.post('/catalog/sync');
    return data;
  },
};
