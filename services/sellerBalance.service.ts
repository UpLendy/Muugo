import { apiClient } from '@/lib/api-client';

export interface TopupBody {
  amountCents: number;
  paymentMethodId?: number;
  cellphone?: string;
  returnUrl?: string;
}

export const sellerBalanceService = {
  getBalance: async () => {
    const { data } = await apiClient.get('/seller-balance/');
    return data;
  },

  topup: async (body: TopupBody) => {
    const { data } = await apiClient.post('/seller-balance/topup', body);
    return data;
  },

  getTopups: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get('/seller-balance/topups', { params });
    return data;
  },

  getTopup: async (id: string) => {
    const { data } = await apiClient.get(`/seller-balance/topups/${id}`);
    return data;
  },

  getMovements: async (params?: { type?: string; from?: string; to?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get('/seller-balance/movements', { params });
    return data;
  },

  getAdminTopups: async (params?: { page?: number; limit?: number; status?: string; email?: string; from?: string; to?: string }) => {
    const { data } = await apiClient.get('/seller-balance/admin/topups', { params });
    return data;
  },

  runReconciliation: async () => {
    const { data } = await apiClient.post('/seller-balance/admin/reconcile');
    return data;
  },

  getReconciliationLogs: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get('/seller-balance/admin/reconciliation-logs', { params });
    return data;
  },
};
