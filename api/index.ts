// Convert require to import to resolve Node.js type definition errors in ESM environment
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
const PAYSTACK_SECRET = process.env.VITE_PAYSTACK_SECRET_KEY || '';

// Added explicit typing for parameters to resolve implicit 'any' issues
const callInlomax = async (endpoint: string, payload: any, method: string = 'POST') => {
  const url = `${INLOMAX_BASE_URL}${endpoint}`;
  console.log(`[Proxy] Calling Inlomax: ${method} ${url}`);
  
  try {
    // Explicitly type config as AxiosRequestConfig to fix the error where 'data' property was not found on a literal type
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
    }

    const response = await axios(config);
    console.log(`[Proxy] Inlomax Response: ${response.status}`);
    return { success: true, data: response.data, status: response.status };
  } catch (error: any) {
    const errorData = error.response?.data || { message: error.message };
    console.error(`[Proxy] Inlomax Error [${endpoint}]:`, errorData);
    return {
      success: false,
      error: errorData,
      status: error.response?.status || 500
    };
  }
};

// --- SYSTEM ROUTES ---

// Use Request and Response types from express for route handlers
app.get('/api/terminal/balance', async (_req: Request, res: Response) => {
  const result = await callInlomax('/balance', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Inlomax Balance Unreachable", details: result.error });
});

app.get('/api/terminal/services', async (_req: Request, res: Response) => {
  const result = await callInlomax('/services', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Catalog Sync Blocked", details: result.error });
});

app.get('/api/terminal/banks', async (_req: Request, res: Response) => {
    console.log("[Proxy] Fetching Paystack Banks...");
    try {
        if (!PAYSTACK_SECRET) {
            return res.status(500).json({ status: 'error', message: "Vercel Environment Missing VITE_PAYSTACK_SECRET_KEY" });
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
        const errDetails = error.response?.data || error.message;
        res.status(500).json({ 
            status: 'error', 
            message: "Paystack Gateway Failed", 
            details: typeof errDetails === 'string' ? { raw: "Provider returned non-json response" } : errDetails 
        });
    }
});

app.get('/api/terminal/resolve', async (req: Request, res: Response) => {
    const { accountNumber, bankCode } = req.query;
    try {
        if (!PAYSTACK_SECRET) throw new Error("Paystack Secret Missing");
        
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
            message: "Identity Resolve Failed", 
            details: typeof errDetails === 'string' ? { raw: "Provider returned error page" } : errDetails 
        });
    }
});

// Convert module.exports to export default for ESM compatibility
export default app;