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
const PAYSTACK_SECRET = process.env.VITE_PAYSTACK_SECRET_KEY || 'sk_live_fallback_check_env';

const callInlomax = async (endpoint: string, payload: any, method: 'GET' | 'POST' = 'POST') => {
  const url = `${INLOMAX_BASE_URL}${endpoint}`;
  try {
    const config: any = {
      method,
      url,
      headers: {
        'Authorization': `Token ${INLOMAX_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ObataVTU-Terminal/2.0'
      },
      timeout: 15000 // 15s timeout for large catalog fetches
    };
    
    if (method === 'POST') {
      config.data = payload;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error: any) {
    console.error(`Proxy Error [${endpoint}]:`, error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message },
      status: error.response?.status || 500
    };
  }
};

// --- TERMINAL ROUTES ---

app.get('/api/terminal/balance', async (req, res) => {
  const result = await callInlomax('/balance', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : result.error);
});

app.get('/api/terminal/services', async (req, res) => {
  const result = await callInlomax('/services', {}, 'GET');
  res.status(result.status).json(result.success ? result.data : result.error);
});

app.post('/api/terminal/airtime', async (req, res) => {
  const result = await callInlomax('/airtime', req.body);
  res.status(result.status).json(result.success ? result.data : result.error);
});

app.post('/api/terminal/data', async (req, res) => {
  const result = await callInlomax('/data', req.body);
  res.status(result.status).json(result.success ? result.data : result.error);
});

// Paystack Proxy - Fixed URL and Header
app.get('/api/terminal/banks', async (req, res) => {
    try {
        const response = await axios.get('https://api.paystack.co/bank', {
            headers: { 
                'Authorization': `Bearer ${PAYSTACK_SECRET}`,
                'Content-Type': 'application/json'
            }
        });
        res.json({ status: 'success', data: response.data.data });
    } catch (error: any) {
        console.error("Paystack Bank Error:", error.response?.data || error.message);
        res.status(500).json({ 
            status: 'error', 
            message: "Paystack connection failed", 
            details: error.response?.data || error.message 
        });
    }
});

export default app;