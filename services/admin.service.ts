import { apiClient } from '@/lib/api-client';

export const adminService = {
  async getUsers(params?: { status?: string; role?: string; page?: number; limit?: number; search?: string }) {
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  },
  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned', reason?: string) {
    const { data } = await apiClient.patch(`/admin/users/${userId}/status`, { status, reason });
    return data;
  },
  async updateUserRoles(userId: string, action: 'assign' | 'revoke', roleSlug: string) {
    const { data } = await apiClient.post(`/admin/users/${userId}/roles`, { action, roleSlug });
    return data;
  },
  async getAuditLogs(params?: { userId?: string; action?: string; from?: string; to?: string; page?: number }) {
    const { data } = await apiClient.get('/admin/audit-logs', { params });
    return data;
  },
};
