import { apiClient } from '@/lib/api-client';

export interface ExecuteSellBody {
  refacilProductId: number | string;
  amount?: number;
  chargeId?: string;
  sellData: Record<string, any>;
}

export const sellService = {
  execute: async (body: ExecuteSellBody) => {
    const { data } = await apiClient.post('/sells', body);
    return data;
  },

  list: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await apiClient.get('/sells', { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/sells/${id}`);
    return data;
  },

  retry: async (id: string) => {
    const { data } = await apiClient.post(`/sells/${id}/retry`);
    return data;
  },
};
