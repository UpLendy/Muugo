import { apiClient } from '@/lib/api-client';
import { User } from '@/store/auth-store';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: Record<string, any>): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async register(userData: Record<string, any>): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  async updateProfile(profileData: { firstName: string; lastName: string; phoneNumber?: string }): Promise<User> {
    const { data } = await apiClient.patch<User>('/auth/me', profileData);
    return data;
  },

  async updateAvatar(avatarUrl: string): Promise<User> {
    const { data } = await apiClient.patch<User>('/auth/avatar', { avatarUrl });
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.patch<{ success: boolean; message: string }>('/auth/password', { currentPassword, newPassword });
    return data;
  },
};
