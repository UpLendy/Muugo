import { apiClient } from '@/lib/api-client';

export interface CreateChargeBody {
  amountCents: number;
  paymentMethodId?: number;
  paymentMethodData?: Record<string, unknown>;
  cellphone?: string;
  showSummary?: boolean;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  description?: string;
  returnUrl?: string;
}

export const chargeService = {
  create: async (body: CreateChargeBody) => {
    const { data } = await apiClient.post('/charges', body);
    return data;
  },

  list: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await apiClient.get('/charges', { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/charges/${id}`);
    return data;
  },

  cancel: async (id: string) => {
    const { data } = await apiClient.post(`/charges/${id}/cancel`);
    return data;
  },

  getPseBanks: async () => {
    const { data } = await apiClient.get('/charges/pse-banks');
    return data;
  },

  getTransfiyaBanks: async () => {
    const { data } = await apiClient.get('/charges/transfiya-banks/send');
    return data;
  },
};
