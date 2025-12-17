
import { ApiConfig, ApiResponse } from '../types';

// Points to our local backend during testing
const BACKEND_URL = ''; 

/**
 * Executes an API request with standard headers and error handling.
 * Automatically handles JSON stringification for objects and skips it for FormData.
 */
export const executeApiRequest = async (config: ApiConfig): Promise<ApiResponse> => {
  const startTime = performance.now();
  
  try {
      const isFormData = config.body instanceof FormData;
      const headers: Record<string, string> = {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...(config.headers?.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}) || {})
      };

      const res = await fetch(config.url, {
          method: config.method,
          headers: headers,
          body: isFormData ? config.body : (config.body ? JSON.stringify(config.body) : undefined)
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

/**
 * Checks the Inlomax provider balance.
 */
export const checkInlomaxBalance = async () => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/admin/inlomax-balance`,
        method: 'GET'
    });
};

/**
 * Initiates an airtime purchase transaction.
 */
export const buyAirtime = async (network: string, amount: string | number, phone: string, requestId: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/vtu/airtime`,
        method: 'POST',
        body: { network, amount, mobile_number: phone, request_id: requestId }
    });
};

/**
 * Initiates a data bundle purchase transaction.
 */
export const buyData = async (planId: string, phone: string, requestId: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/vtu/data`,
        method: 'POST',
        body: { planId, mobile_number: phone, request_id: requestId }
    });
};

// Fix: Add missing validateCable export
export const validateCable = async (serviceID: string, iucNumber: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/vtu/validate-cable`,
        method: 'POST',
        body: { serviceID, iucNumber }
    });
};

// Fix: Add missing validateMeter export
export const validateMeter = async (serviceID: string, meterNumber: string, meterType: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/vtu/validate-meter`,
        method: 'POST',
        body: { serviceID, meterNumber, meterType }
    });
};

// Fix: Add missing buyCable export
export const buyCable = async (planId: string, iuc: string, requestId: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/vtu/cable`,
        method: 'POST',
        body: { planId, iuc, request_id: requestId }
    });
};

// Fix: Add missing payElectricity export
export const payElectricity = async (discoId: string, meterNumber: string, amount: string | number, meterType: string, requestId: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/vtu/electricity`,
        method: 'POST',
        body: { discoId, meterNumber, amount, meterType, request_id: requestId }
    });
};

// Fix: Add missing getBanks export
export const getBanks = async () => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/finance/banks`,
        method: 'GET'
    });
};

// Fix: Add missing resolveBankAccount export
export const resolveBankAccount = async (accountNumber: string, bankCode: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/finance/resolve-bank`,
        method: 'POST',
        body: { accountNumber, bankCode }
    });
};

// Fix: Add missing verifyPayment export
export const verifyPayment = async (reference: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/api/finance/verify?reference=${reference}`,
        method: 'GET'
    });
};

// Fix: Add missing uploadImageToImgBB export
export const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const key = '6335530a0b22ceea3ae8c5699049bd5e'; 
    
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    if (data.success) return data.data.url;
    throw new Error('Image upload failed');
};
