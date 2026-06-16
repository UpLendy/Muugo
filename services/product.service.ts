import { apiClient } from '@/lib/api-client';

export const productService = {
  async createProduct(productData: Record<string, any>) {
    const { data } = await apiClient.post('/products', productData);
    return data;
  },

  async getProducts(params?: Record<string, any>) {
    const { data } = await apiClient.get('/products', { params });
    return data;
  },

  async getProduct(productId: string) {
    const { data } = await apiClient.get(`/products/${productId}`);
    return data;
  },

  async updateProduct(productId: string, productData: Record<string, any>) {
    const { data } = await apiClient.put(`/products/${productId}`, productData);
    return data;
  },

  async deleteProduct(productId: string) {
    const { data } = await apiClient.delete(`/products/${productId}`);
    return data;
  },

  async addProductImage(productId: string, imageData: { url: string; altText?: string; position?: number }) {
    const { data } = await apiClient.post(`/products/${productId}/images`, imageData);
    return data;
  },

  async deleteProductImage(productId: string, imageId: string) {
    const { data } = await apiClient.delete(`/products/${productId}/images/${imageId}`);
    return data;
  },

  async getAvailableStock(productId: string) {
    const { data } = await apiClient.get(`/inventory/available/${productId}`);
    return data;
  },
};
