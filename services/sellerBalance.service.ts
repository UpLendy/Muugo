import { apiClient } from '@/lib/api-client';

export const sellerBalanceService = {
  async getBalance() {
    const { data } = await apiClient.get('/seller-balance/');
    return data;
  },
  async initiateTopup(body: { amountCents: number; paymentMethodId?: number; cellphone?: string; returnUrl?: string }) {
    const { data } = await apiClient.post('/seller-balance/topup', body);
    return data;
  },
  async getTopups(params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get('/seller-balance/topups', { params });
    return data;
  },
  async getTopup(topupId: string) {
    const { data } = await apiClient.get(`/seller-balance/topups/${topupId}`);
    return data;
  },
  async getMovements(params?: { type?: string; from?: string; to?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/seller-balance/movements', { params });
    return data;
  },
};
