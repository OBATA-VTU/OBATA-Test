import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// OBATA VTU CORE CONFIGURATION
const INLOMAX_BASE_URL = 'https://inlomax.com/api';
const INLOMAX_API_KEY = 'se2h4rl9cqhabg07tft55ivg4sp9b0a5jca1u3qe';
const PAYSTACK_SECRET = process.env.VITE_PAYSTACK_SECRET_KEY || '';

const callInlomax = async (endpoint: string, payload: any, method: 'GET' | 'POST' = 'POST') => {
  const url = `${INLOMAX_BASE_URL}${endpoint}`;
  console.log(`[Proxy] Calling Inlomax: ${method} ${url}`);
  
  try {
    const config: any = {
      method,
      url,
      headers: {
        'Authorization': `Token ${INLOMAX_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ObataVTU-Terminal/2.2'
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

// Inlomax Balance
app.get('/api/terminal/balance', async (_req, res) => {
  const result = await callInlomax('/balance', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Balance Fetch Failed", details: result.error });
});

// Inlomax Catalog Sync
app.get('/api/terminal/services', async (_req, res) => {
  const result = await callInlomax('/services', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : { status: 'error', message: "Catalog Sync Failed", details: result.error });
});

// Paystack Bank Fetch
app.get('/api/terminal/banks', async (_req, res) => {
    console.log("[Proxy] Fetching Paystack Banks...");
    try {
        if (!PAYSTACK_SECRET) {
            console.error("[Proxy] Missing PAYSTACK_SECRET env variable");
            return res.status(500).json({ status: 'error', message: "Server Configuration Error: Missing Secret Key" });
        }
        
        const response = await axios.get('https://api.paystack.co/bank', {
            headers: { 
                'Authorization': `Bearer ${PAYSTACK_SECRET}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        console.log("[Proxy] Paystack Banks Fetched Successfully");
        res.json({ status: 'success', data: response.data.data });
    } catch (error: any) {
        const errDetails = error.response?.data || error.message;
        console.error("[Proxy] Paystack Bank Error:", errDetails);
        res.status(500).json({ 
            status: 'error', 
            message: "Paystack Bank List Failed", 
            details: typeof errDetails === 'string' && errDetails.startsWith('<!DOCTYPE') ? { html_error: "Provider returned HTML instead of JSON" } : errDetails 
        });
    }
});

// Paystack Account Resolve
app.get('/api/terminal/resolve', async (req, res) => {
    const { accountNumber, bankCode } = req.query;
    console.log(`[Proxy] Resolving Paystack Account: ${accountNumber} (${bankCode})`);
    try {
        if (!PAYSTACK_SECRET) throw new Error("Paystack Secret Key Missing");
        
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
        console.error("[Proxy] Paystack Resolve Error:", errDetails);
        res.status(500).json({ 
            status: 'error', 
            message: "Identity Resolve Failed", 
            details: typeof errDetails === 'string' && errDetails.startsWith('<!DOCTYPE') ? { html_error: "Provider returned HTML error page" } : errDetails 
        });
    }
});

export default app;