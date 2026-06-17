import { apiClient } from '@/lib/api-client';

export const accountService = {
  async getNotificationPreferences() {
    const { data } = await apiClient.get('/account/notifications');
    return data;
  },
  async updateNotificationPreferences(prefs: {
    emailOrders?: boolean;
    emailPayments?: boolean;
    emailMarketing?: boolean;
    pushOrders?: boolean;
    pushPayments?: boolean;
    smsOrders?: boolean;
    smsPayments?: boolean;
  }) {
    const { data } = await apiClient.patch('/account/notifications', prefs);
    return data;
  },
  async getEnrollmentData() {
    const { data } = await apiClient.get('/account/enrollment-data');
    return data;
  },
};
