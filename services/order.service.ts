import { apiClient } from '@/lib/api-client';

export interface OrderItem {
  storeProductId: string;
  quantity: number;
  amount?: number;
  deliveryData: Record<string, any>;
}

export const orderService = {
  // ÓRDENES
  async createOrder(body: { storeId: string; items: OrderItem[]; note?: string }) {
    const { data } = await apiClient.post('/orders', body);
    return data;
  },
  async getOrders(params?: { storeId?: string; status?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/orders', { params });
    return data;
  },
  async getOrder(orderId: string) {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data;
  },
  async cancelOrder(orderId: string, reason?: string) {
    const { data } = await apiClient.delete(`/orders/${orderId}`, { data: reason ? { reason } : undefined });
    return data;
  },
  async updateOrderStatus(orderId: string, status: string, reason?: string) {
    const { data } = await apiClient.patch(`/orders/${orderId}/status`, { status, reason });
    return data;
  },

  // PAGOS
  async initiatePayment(orderId: string, body: { provider?: 'pay' | 'commerce'; returnUrl?: string; urlCommerce?: string }) {
    const { data } = await apiClient.post(`/payments/orders/${orderId}/initiate`, body);
    return data;
  },
  async getPaymentStatus(reference: string) {
    const { data } = await apiClient.get(`/payments/status/${reference}`);
    return data;
  },
  async getPaymentHistory(params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get('/payments/history', { params });
    return data;
  },
  async getPseBanks() {
    const { data } = await apiClient.get('/payments/pse-banks');
    return data;
  },
  async getTransfiyaBanks(transferType: 'send' | 'receive') {
    const { data } = await apiClient.get(`/payments/transfiya-banks/${transferType}`);
    return data;
  },
};
