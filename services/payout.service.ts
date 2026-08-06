import { apiClient } from '@/lib/api-client';

export const payoutService = {
  async getBalance(storeId: string) {
    const { data } = await apiClient.get(`/stores/${storeId}/balance`);
    return data;
  },

  async configureAccount(storeId: string, accountData: Record<string, any>) {
    const { data } = await apiClient.put(`/stores/${storeId}/payout-account`, accountData);
    return data;
  },

  async getAccount(storeId: string) {
    const { data } = await apiClient.get(`/stores/${storeId}/payout-account`);
    return data;
  },

  async requestPayout(storeId: string, requestData: Record<string, any>) {
    const { data } = await apiClient.post(`/stores/${storeId}/payout-requests`, requestData);
    return data;
  },

  async getPayoutRequests(storeId: string, params?: Record<string, any>) {
    const { data } = await apiClient.get(`/stores/${storeId}/payout-requests`, { params });
    return data;
  },

  // Solo Admin
  async executePayout(storeId: string, requestId: string) {
    const { data } = await apiClient.post(`/stores/${storeId}/payout-requests/${requestId}/execute`);
    return data;
  },
};
