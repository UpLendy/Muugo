import { apiClient } from '@/lib/api-client';

export type ReportType = 'sells' | 'charges' | 'commissions' | 'extracto' | 'traslados';

export const reportsService = {
  async getReport(type: ReportType, params?: { from?: string; to?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get(`/reports/${type}`, { params });
    return data;
  },

  async downloadReport(type: ReportType, params?: { from?: string; to?: string; status?: string }) {
    const response = await apiClient.get(`/reports/${type}`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
