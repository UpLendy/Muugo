import { apiClient } from '@/lib/api-client';

export const uploadService = {
  // Paso 1: Obtener la presigned URL de S3
  async getPresignedUrl(type: 'product-image' | 'user-avatar' | 'seller-avatar', entityId: string, filename: string, contentType: string) {
    const { data } = await apiClient.post(`/upload/presigned/${type}/${entityId}`, {
      filename,
      contentType,
    });
    return data;
  },

  // Paso 2: Subir el archivo directamente a S3
  async uploadToS3(uploadUrl: string, file: File) {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }

    return true;
  },
};
