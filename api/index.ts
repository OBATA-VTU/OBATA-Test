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

const callInlomax = async (endpoint: string, payload: any, method: string = 'POST') => {
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
        ? { message: `Route ${endpoint} Not Found (404)`, code: "ENDPOINT_MISMATCH" } 
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

// --- INQUIRY ROUTES (Bank Resolution / Status) ---

app.post('/api/terminal/inquiry', async (req: Request, res: Response) => {
  // Supports both { bankCode, acctNum } and { reference } as per docs
  const result = await callInlomax('/transaction', req.body, 'POST');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Inquiry Node Fault", details: result.error });
});

// --- PURCHASE & VALIDATION ROUTES ---

app.post('/api/terminal/purchase/airtime', async (req: Request, res: Response) => {
  const result = await callInlomax('/airtime', req.body, 'POST');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Airtime Purchase Node Fault", details: result.error });
});

app.post('/api/terminal/purchase/data', async (req: Request, res: Response) => {
  const result = await callInlomax('/data', req.body, 'POST');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Data Purchase Node Fault", details: result.error });
});

app.post('/api/terminal/purchase/cable', async (req: Request, res: Response) => {
  const result = await callInlomax('/subcable', req.body, 'POST');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Cable Purchase Node Fault", details: result.error });
});

app.post('/api/terminal/purchase/electricity', async (req: Request, res: Response) => {
  const result = await callInlomax('/payelectric', req.body, 'POST');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Electric Purchase Node Fault", details: result.error });
});

app.post('/api/terminal/purchase/education', async (req: Request, res: Response) => {
  const result = await callInlomax('/education', req.body, 'POST');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Education Purchase Node Fault", details: result.error });
});

app.post('/api/terminal/validate/cable', async (req: Request, res: Response) => {
  const result = await callInlomax('/validatecable', req.body, 'POST');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Cable Validation Node Fault", details: result.error });
});

app.post('/api/terminal/validate/meter', async (req: Request, res: Response) => {
  const result = await callInlomax('/validatemeter', req.body, 'POST');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Meter Validation Node Fault", details: result.error });
});

// --- PAYSTACK ROUTES ---

app.get('/api/terminal/banks', async (_req: Request, res: Response) => {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || process.env.VITE_PAYSTACK_SECRET_KEY || '';
    try {
        if (!PAYSTACK_SECRET) return res.status(500).json({ status: 'error', message: "Infrastructure Fault: Secret Key Missing" });
        const response = await axios.get('https://api.paystack.co/bank', {
            headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET}` }
        });
        res.json({ status: 'success', data: response.data.data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: "Gateway Communication Timeout" });
    }
});

export default app;