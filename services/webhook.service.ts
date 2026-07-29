import { apiClient } from '@/lib/api-client';

export const webhookService = {
  async list(params?: {
    source?: string;
    processed?: boolean;
    reference?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await apiClient.get('/webhooks', { params });
    return data;
  },
  async getById(id: string) {
    const { data } = await apiClient.get(`/webhooks/${id}`);
    return data;
  },
};
