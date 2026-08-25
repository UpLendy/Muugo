import { apiClient } from '@/lib/api-client';

export const adminService = {
  async getUsers(params?: { email?: string; isActive?: string; isBanned?: string; role?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  },
  async updateUserStatus(userId: string, action: 'activate' | 'suspend' | 'ban', reason?: string) {
    const { data } = await apiClient.patch(`/admin/users/${userId}/status`, { action, reason });
    return data;
  },
  async updateUserRoles(userId: string, action: 'assign' | 'revoke', roleSlug: string) {
    const { data } = await apiClient.post(`/admin/users/${userId}/roles`, { action, roleSlug });
    return data;
  },
  async updateCommissionRate(userId: string, commissionRate: number | null) {
    const { data } = await apiClient.patch(`/admin/users/${userId}/commission-rate`, { commissionRate });
    return data;
  },
  async getAuditLogs(params?: { userId?: string; action?: string; from?: string; to?: string; page?: number }) {
    const { data } = await apiClient.get('/admin/audit-logs', { params });
    return data;
  },
};
