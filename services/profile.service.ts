import { apiClient } from '@/lib/api-client';

export const profileService = {
  // Customer Profile
  async getCustomerProfile(userId: string) {
    const { data } = await apiClient.get(`/users/${userId}/customer/profile`);
    return data;
  },

  async updateCustomerPreferences(userId: string, preferences: Record<string, any>) {
    const { data } = await apiClient.patch(`/users/${userId}/customer/preferences`, preferences);
    return data;
  },

  // Seller Profile
  async createSellerProfile(userId: string, profileData: Record<string, any>) {
    const { data } = await apiClient.post(`/users/${userId}/seller/profile`, profileData);
    return data;
  },

  async getSellerProfile(userId: string) {
    const { data } = await apiClient.get(`/users/${userId}/seller/profile`);
    return data;
  },

  async updateSellerProfile(userId: string, profileData: Record<string, any>) {
    const { data } = await apiClient.patch(`/users/${userId}/seller/profile`, profileData);
    return data;
  },
};
