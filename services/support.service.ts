import { apiClient } from '@/lib/api-client';

export const supportService = {
  async getArticles(params?: { category?: string; search?: string }) {
    const { data } = await apiClient.get('/support/articles', { params });
    return data;
  },
  async getArticle(id: string) {
    const { data } = await apiClient.get(`/support/articles/${id}`);
    return data;
  },
  async createArticle(body: { title: string; content: string; category: string }) {
    const { data } = await apiClient.post('/support/articles', body);
    return data;
  },
  async getTickets() {
    const { data } = await apiClient.get('/support/tickets');
    return data;
  },
  async createTicket(body: { subject: string; description: string; category: string }) {
    const { data } = await apiClient.post('/support/tickets', body);
    return data;
  },
  async getTicket(id: string) {
    const { data } = await apiClient.get(`/support/tickets/${id}`);
    return data;
  },
  async replyTicket(id: string, message: string) {
    const { data } = await apiClient.post(`/support/tickets/${id}/messages`, { message });
    return data;
  },
  async updateTicketStatus(id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') {
    const { data } = await apiClient.patch(`/support/tickets/${id}/status`, { status });
    return data;
  },
};
