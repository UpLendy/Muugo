import { apiClient } from '@/lib/api-client';

type ReportType = 'sells' | 'charges' | 'commissions' | 'extracto' | 'traslados';

export const reportsService = {
  async getReport(type: ReportType, params?: { from?: string; to?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get(`/reports/${type}`, { params });
    return data;
  },

  downloadReport(type: ReportType, params?: { from?: string; to?: string }) {
    const query = new URLSearchParams({ ...params, format: 'csv' } as any).toString();
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/reports/${type}?${query}`);
  },
};
