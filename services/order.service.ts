import { apiClient } from '@/lib/api-client';

export const orderService = {
  async createOrder(userId: string, orderData: Record<string, any>) {
    const { data } = await apiClient.post(`/users/${userId}/orders`, orderData);
    return data;
  },

  async initPayment(userId: string, orderId: string, paymentConfig?: Record<string, any>) {
    const { data } = await apiClient.post(`/users/${userId}/orders/${orderId}/pay`, paymentConfig || {});
    return data;
  },

  async getOrder(userId: string, orderId: string) {
    const { data } = await apiClient.get(`/users/${userId}/orders/${orderId}`);
    return data;
  },

  async getOrders(userId: string, params?: Record<string, any>) {
    const { data } = await apiClient.get(`/users/${userId}/orders`, { params });
    return data;
  },

  async cancelOrder(userId: string, orderId: string, reason?: string) {
    const { data } = await apiClient.delete(`/users/${userId}/orders/${orderId}`, {
      data: reason ? { reason } : undefined,
    });
    return data;
  },
};
