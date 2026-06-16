import { apiClient } from '@/lib/api-client';

export const addressService = {
  async createAddress(userId: string, addressData: Record<string, any>) {
    const { data } = await apiClient.post(`/users/${userId}/addresses`, addressData);
    return data;
  },

  async getAddresses(userId: string) {
    const { data } = await apiClient.get(`/users/${userId}/addresses`);
    return data;
  },

  async getAddress(userId: string, addressId: string) {
    const { data } = await apiClient.get(`/users/${userId}/addresses/${addressId}`);
    return data;
  },

  async updateAddress(userId: string, addressId: string, addressData: Record<string, any>) {
    const { data } = await apiClient.put(`/users/${userId}/addresses/${addressId}`, addressData);
    return data;
  },

  async deleteAddress(userId: string, addressId: string) {
    const { data } = await apiClient.delete(`/users/${userId}/addresses/${addressId}`);
    return data;
  },

  async setDefaultAddress(userId: string, addressId: string, type: 'shipping' | 'billing') {
    const { data } = await apiClient.patch(`/users/${userId}/addresses/${addressId}/set-default/${type}`);
    return data;
  },
};
