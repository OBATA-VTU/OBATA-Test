import { ApiConfig, ApiResponse } from '../types';

// Points to our local backend proxy during development and production
const BACKEND_URL = '/api'; 

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
          statusText: 'Gateway Timeout',
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
        url: `${BACKEND_URL}/terminal/balance`,
        method: 'GET'
    });
};

/**
 * Initiates an airtime purchase transaction.
 */
export const buyAirtime = async (network: string, amount: string | number, phone: string, requestId: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/terminal/purchase/airtime`,
        method: 'POST',
        body: { network, amount, mobileNumber: phone, requestId }
    });
};

/**
 * Initiates a data bundle purchase transaction.
 */
export const buyData = async (serviceID: string, phone: string, requestId: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/terminal/purchase/data`,
        method: 'POST',
        body: { serviceID, mobileNumber: phone, requestId }
    });
};

/**
 * Validates cable account (IUC).
 */
export const validateCable = async (serviceID: string, iucNum: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/terminal/validate/cable`,
        method: 'POST',
        body: { serviceID, iucNum }
    });
};

/**
 * Validates electricity meter.
 */
export const validateMeter = async (serviceID: string, meterNum: string, meterType: number) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/terminal/validate/meter`,
        method: 'POST',
        body: { serviceID, meterNum, meterType }
    });
};

/**
 * Initiates a cable TV purchase transaction.
 */
export const buyCable = async (serviceID: string, iucNum: string, requestId: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/terminal/purchase/cable`,
        method: 'POST',
        body: { serviceID, iucNum, requestId }
    });
};

/**
 * Initiates an electricity bill payment.
 */
export const payElectricity = async (serviceID: string, meterNum: string, amount: string | number, meterType: number, requestId: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/terminal/purchase/electricity`,
        method: 'POST',
        body: { serviceID, meterNum, amount, meterType, requestId }
    });
};

/**
 * Fetches available banks from Paystack bridge.
 */
export const getBanks = async () => {
    return executeApiRequest({
        url: `${BACKEND_URL}/terminal/banks`,
        method: 'GET'
    });
};

/**
 * Resolves a bank account name.
 */
export const resolveBankAccount = async (acctNum: string, bankCode: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/terminal/inquiry`,
        method: 'POST',
        body: { acctNum, bankCode }
    });
};

/**
 * Verifies a transaction status via Inlomax inquiry node.
 */
export const verifyTransaction = async (reference: string) => {
    return executeApiRequest({
        url: `${BACKEND_URL}/terminal/inquiry`,
        method: 'POST',
        body: { reference }
    });
};

/**
 * Image upload utility.
 */
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