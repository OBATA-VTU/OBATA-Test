import { ApiConfig, ApiResponse } from '../types';
import { auth } from './firebase';

const getEnv = (key: string) => {
  // @ts-ignore
  return import.meta.env?.[key] || '';
};

// Point to our own Backend Proxy
const BACKEND_URL = getEnv('VITE_BACKEND_URL') || '/api'; // Use relative path if proxied by Vite/Vercel

// Helper to get Firebase Token
const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return user.getIdToken();
};

export const executeApiRequest = async (config: ApiConfig): Promise<ApiResponse> => {
  const startTime = performance.now();
  
  try {
      const token = await getAuthToken();
      const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(config.headers?.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}) || {})
      };

      const res = await fetch(config.url, {
          method: config.method,
          headers: headers,
          body: config.body
      });

      const endTime = performance.now();
      const data = await res.json();

      return {
          success: res.ok,
          status: res.status,
          statusText: res.statusText,
          data: data,
          duration: Math.round(endTime - startTime),
      };
  } catch (error: any) {
      return {
          success: false,
          status: 0,
          statusText: 'Client Error',
          data: { error: error.message },
          duration: 0,
          error: error.message
      };
  }
};

// --- Real Service Functions (Via Backend) ---

export const buyAirtime = async (network: string, amount: number, phone: string, requestId: string) => {
  return executeApiRequest({
    url: `${BACKEND_URL}/vtu/airtime`,
    method: 'POST',
    body: JSON.stringify({ network, amount, mobile_number: phone, request_id: requestId })
  });
};

export const buyData = async (planId: string, phone: string, requestId: string) => {
  return executeApiRequest({
    url: `${BACKEND_URL}/vtu/data`,
    method: 'POST',
    body: JSON.stringify({ plan_id: planId, mobile_number: phone, request_id: requestId })
  });
};

export const validateMeter = async (discoId: string, meterNumber: string, meterType: string) => {
  return executeApiRequest({
    url: `${BACKEND_URL}/vtu/verify/meter`,
    method: 'POST',
    body: JSON.stringify({ serviceID: discoId, meterNum: meterNumber, meterType })
  });
};

export const validateCable = async (serviceId: string, iucNumber: string) => {
  return executeApiRequest({
    url: `${BACKEND_URL}/vtu/verify/cable`,
    method: 'POST',
    body: JSON.stringify({ serviceID: serviceId, iucNum: iucNumber })
  });
};

export const syncAdminPlans = async () => {
    return executeApiRequest({
        url: `${BACKEND_URL}/admin/sync-plans`,
        method: 'POST'
    });
};

export const uploadImageToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  // Direct call to ImgBB (Client-side key is acceptable for ImgBB as it's public upload)
  // Ideally this should also go through backend to hide key, but keeping simple for file upload
  const key = '6335530a0b22ceea3ae8c5699049bd5e'; 
  
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: 'POST',
      body: formData
  });
  const data = await res.json();
  if (data.success) return data.data.url;
  throw new Error('Image upload failed');
};