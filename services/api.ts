import { ApiConfig, ApiResponse } from '../types';
import { auth } from './firebase';

const getEnv = (key: string) => {
  // @ts-ignore
  return import.meta.env?.[key] || '';
};

// Point to our own Backend Proxy
const BACKEND_URL = getEnv('VITE_BACKEND_URL') || '/api'; 

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

      if (!res.ok) {
          let errorMessage = "An unexpected error occurred.";
          if (data && data.error) errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
          else if (data && data.message) errorMessage = data.message;
          
          return {
              success: false,
              status: res.status,
              statusText: res.statusText,
              data: data,
              duration: Math.round(endTime - startTime),
              error: errorMessage
          };
      }

      return {
          success: true,
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

// --- Service Functions ---

export const getBanks = async () => {
    return executeApiRequest({
        url: `${BACKEND_URL}/misc/banks`,
        method: 'GET'
    });
};

export const resolveBankAccount = async (accountNumber: string, bankCode: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/misc/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`,
        method: 'GET'
    });
};

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

export const buyCable = async (planId: string, iucNumber: string, requestId: string) => {
  return executeApiRequest({
    url: `${BACKEND_URL}/vtu/cable`,
    method: 'POST',
    body: JSON.stringify({ plan_id: planId, iuc_number: iucNumber, request_id: requestId })
  });
};

export const payElectricity = async (discoId: string, meterNumber: string, amount: number, meterType: string, requestId: string) => {
  return executeApiRequest({
    url: `${BACKEND_URL}/vtu/electricity`,
    method: 'POST',
    body: JSON.stringify({ disco_id: discoId, meter_number: meterNumber, amount, meter_type: meterType, request_id: requestId })
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

export const verifyPayment = async (reference: string) => {
  return executeApiRequest({
    url: `${BACKEND_URL}/payment/verify/${reference}`,
    method: 'GET'
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
  const key = '6335530a0b22ceea3ae8c5699049bd5e'; 
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: 'POST', body: formData });
  const data = await res.json();
  if (data.success) return data.data.url;
  throw new Error('Image upload failed');
};