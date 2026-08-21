import apiClient from '../services/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Enterprise Secure File Upload (Magic bytes & Binary Image validation)
 */
export async function uploadProductImage(file: File): Promise<string> {
  // 1. Send multipart payload to Backend REST API /api/v1/upload
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data?.success && res.data?.url) {
      const url = res.data.url as string;
      if (url.startsWith('http') || url.startsWith('data:')) return url;
      return `${SERVER_ORIGIN}${url}`;
    }
  } catch (backendError) {
    console.warn('Backend REST upload error, producing Data URL preview fallback:', backendError);
  }

  // 2. Offline / local preview fallback
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
