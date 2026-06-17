import { apiClient } from '@/lib/api-client';

export const salesService = {
  async getOrderSales(orderId: string) {
    const { data } = await apiClient.get(`/sales/orders/${orderId}`);
    return data;
  },
  async getSale(saleId: string) {
    const { data } = await apiClient.get(`/sales/${saleId}`);
    return data;
  },
};
