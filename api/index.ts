import express, { Request, Response } from 'express';
import cors from 'cors';
import axios, { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// OBATA VTU CORE CONFIGURATION
const INLOMAX_BASE_URL = 'https://inlomax.com/api';
const INLOMAX_API_KEY = 'se2h4rl9cqhabg07tft55ivg4sp9b0a5jca1u3qe';

/**
 * PAYSTACK SECRET KEY RESOLUTION
 * Bank resolution and listing MUST use the Secret Key (sk_...).
 */
const PAYSTACK_SECRET = 
    process.env.PAYSTACK_SECRET_KEY || 
    process.env.VITE_PAYSTACK_SECRET_KEY || 
    process.env.PAYSTACK_PUBLIC_KEY || 
    process.env.VITE_PAYSTACK_PUBLIC_KEY || 
    '';

const callInlomax = async (endpoint: string, payload: any, method: string = 'POST') => {
  // Ensure we don't have double slashes if base has trailing
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${INLOMAX_BASE_URL}${cleanEndpoint}`;
  
  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        'Authorization': `Token ${INLOMAX_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ObataVTU-Terminal/2.3'
      },
      timeout: 25000 
    };
    
    if (method === 'POST') {
      config.data = payload;
    } else if (method === 'GET' && Object.keys(payload).length > 0) {
      config.params = payload;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error: any) {
    const errorData = error.response?.data || error.message;
    console.error(`[Inlomax Fault] ${endpoint}:`, typeof errorData === 'string' && errorData.includes('<!DOCTYPE') ? 'HTML_ERROR_PAGE' : errorData);
    
    return {
      success: false,
      error: typeof errorData === 'string' && errorData.includes('<!DOCTYPE') 
        ? { message: "Route Not Found on Provider Node (404)", code: "ENDPOINT_MISMATCH" } 
        : errorData,
      status: error.response?.status || 500
    };
  }
};

// --- SYSTEM ROUTES ---

app.get('/api/terminal/balance', async (_req: Request, res: Response) => {
  const result = await callInlomax('/balance', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Liquidity Node Offline", details: result.error });
});

app.get('/api/terminal/services', async (_req: Request, res: Response) => {
  const result = await callInlomax('/services', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Catalog Registry Blocked", details: result.error });
});

// --- VALIDATION ROUTES ---
// Corrected to standard Inlomax lookup endpoints (GET /validate-iuc and GET /validate-meter)

app.get('/api/terminal/validate-cable', async (req: Request, res: Response) => {
  const { serviceID, iucNumber } = req.query;
  // Inlomax standard endpoint is usually /validate-iuc
  const result = await callInlomax('/validate-iuc', { serviceID, iucNumber }, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Cable Validation Node Fault", details: result.error });
});

app.get('/api/terminal/validate-meter', async (req: Request, res: Response) => {
  const { serviceID, meterNumber, meterType } = req.query;
  const result = await callInlomax('/validate-meter', { serviceID, meterNumber, meterType }, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Meter Validation Node Fault", details: result.error });
});

// --- PAYSTACK ROUTES ---

app.get('/api/terminal/banks', async (_req: Request, res: Response) => {
    try {
        if (!PAYSTACK_SECRET) {
            return res.status(500).json({ status: 'error', message: "Infrastructure Fault: Secret Key Missing" });
        }

        if (PAYSTACK_SECRET.startsWith('pk_')) {
            return res.status(401).json({ 
                status: 'error', 
                message: "Security Mismatch",
                details: "Secret Key (sk_...) required for bank sync."
            });
        }
        
        const response = await axios.get('https://api.paystack.co/bank', {
            headers: { 
                'Authorization': `Bearer ${PAYSTACK_SECRET}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        res.json({ status: 'success', data: response.data.data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: "Gateway Communication Timeout" });
    }
});

app.get('/api/terminal/resolve', async (req: Request, res: Response) => {
    const { accountNumber, bankCode } = req.query;
    
    try {
        if (!PAYSTACK_SECRET) throw new Error("Key Missing");
        if (PAYSTACK_SECRET.startsWith('pk_')) throw new Error("Secret Key Required");
        
        const response = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
            headers: { 
                'Authorization': `Bearer ${PAYSTACK_SECRET}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        res.json({ status: 'success', data: response.data.data });
    } catch (error: any) {
        const errDetails = error.response?.data || error.message;
        res.status(500).json({ 
            status: 'error', 
            message: "Identity Verification Fault", 
            details: errDetails 
        });
    }
});

export default app;