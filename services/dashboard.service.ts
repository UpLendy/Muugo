import { apiClient } from '@/lib/api-client';

export const dashboardService = {
  async getSummary(params?: { from?: string; to?: string }) {
    const { data } = await apiClient.get('/dashboard/summary', { params });
    return data;
  },
};
