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
 * PAYSTACK KEY RESOLUTION
 * Backend needs a key for bank sync/resolution. 
 * We check Secret first, then fallback to Public keys if provided in Vercel env.
 */
const PAYSTACK_KEY = 
    process.env.PAYSTACK_SECRET_KEY || 
    process.env.VITE_PAYSTACK_SECRET_KEY || 
    process.env.VITE_PAYSTACK_PUBLIC_KEY || 
    process.env.PAYSTACK_PUBLIC_KEY || 
    '';

const callInlomax = async (endpoint: string, payload: any, method: string = 'POST') => {
  const url = `${INLOMAX_BASE_URL}${endpoint}`;
  console.log(`[Proxy] Handshake Started: ${method} ${url}`);
  
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
    }

    const response = await axios(config);
    console.log(`[Proxy] Provider Success: ${response.status}`);
    return { success: true, data: response.data, status: response.status };
  } catch (error: any) {
    const errorData = error.response?.data || { message: error.message };
    console.error(`[Proxy] Provider Error [${endpoint}]:`, errorData);
    return {
      success: false,
      error: errorData,
      status: error.response?.status || 500
    };
  }
};

// --- SYSTEM ROUTES ---

app.get('/api/terminal/balance', async (_req: Request, res: Response) => {
  const result = await callInlomax('/balance', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Inlomax Balance Node Offline", details: result.error });
});

app.get('/api/terminal/services', async (_req: Request, res: Response) => {
  const result = await callInlomax('/services', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Catalog Registry Blocked", details: result.error });
});

app.get('/api/terminal/banks', async (_req: Request, res: Response) => {
    console.log(`[Proxy] Probing Paystack... (Key Present: ${!!PAYSTACK_KEY})`);
    try {
        if (!PAYSTACK_KEY) {
            console.error("[Proxy] ERROR: No Paystack Key found in Vercel Environment Variables");
            return res.status(500).json({ status: 'error', message: "Infrastructure Fault: Paystack Key (Public or Secret) Missing in Vercel Settings" });
        }
        
        const response = await axios.get('https://api.paystack.co/bank', {
            headers: { 
                'Authorization': `Bearer ${PAYSTACK_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        res.json({ status: 'success', data: response.data.data });
    } catch (error: any) {
        const errDetails = error.response?.data || error.message;
        console.error("[Proxy] Paystack Bank Error:", errDetails);
        res.status(500).json({ 
            status: 'error', 
            message: "Paystack Gateway Refused Connection", 
            details: typeof errDetails === 'string' ? { raw: "Gateway returned non-JSON error. Check key validity." } : errDetails 
        });
    }
});

app.get('/api/terminal/resolve', async (req: Request, res: Response) => {
    const { accountNumber, bankCode } = req.query;
    console.log(`[Proxy] Resolving Identity: ${accountNumber} on ${bankCode}`);
    try {
        if (!PAYSTACK_KEY) throw new Error("Paystack Key Missing");
        
        const response = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
            headers: { 
                'Authorization': `Bearer ${PAYSTACK_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        res.json({ status: 'success', data: response.data.data });
    } catch (error: any) {
        const errDetails = error.response?.data || error.message;
        res.status(500).json({ 
            status: 'error', 
            message: "Identity Verification Protocol Fault", 
            details: typeof errDetails === 'string' ? { raw: "Resolution node returned an error page." } : errDetails 
        });
    }
});

export default app;