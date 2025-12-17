import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// FIXED INLOMAX CONFIGURATION FROM PROVIDED DOCS
const INLOMAX_BASE_URL = 'https://inlomax.com/api';
const INLOMAX_API_KEY = 'se2h4rl9cqhabg07tft55ivg4sp9b0a5jca1u3qe';

const callInlomax = async (endpoint: string, payload: any, method: 'GET' | 'POST' = 'POST') => {
  const url = `${INLOMAX_BASE_URL}${endpoint}`;
  try {
    const config: any = {
      method,
      url,
      headers: {
        'Authorization': `Token ${INLOMAX_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (method === 'POST') {
      config.data = payload;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// --- TRANSACTION TERMINAL ROUTES ---

// 1. Balance
app.get('/api/terminal/balance', async (req, res) => {
  const result = await callInlomax('/balance', {}, 'GET');
  res.status(result.status).json(result.data);
});

// 2. Airtime
app.post('/api/terminal/airtime', async (req, res) => {
  const result = await callInlomax('/airtime', req.body);
  res.status(result.status).json(result.data);
});

// 3. Data
app.post('/api/terminal/data', async (req, res) => {
  const result = await callInlomax('/data', req.body);
  res.status(result.status).json(result.data);
});

// 4. Cable Validation
app.post('/api/terminal/validate-cable', async (req, res) => {
  const result = await callInlomax('/validatecable', req.body);
  res.status(result.status).json(result.data);
});

// 5. Cable Purchase
app.post('/api/terminal/buy-cable', async (req, res) => {
  const result = await callInlomax('/subcable', req.body);
  res.status(result.status).json(result.data);
});

// 6. Electricity Validation
app.post('/api/terminal/validate-meter', async (req, res) => {
  const result = await callInlomax('/validatemeter', req.body);
  res.status(result.status).json(result.data);
});

// 7. Electricity Purchase
app.post('/api/terminal/buy-electricity', async (req, res) => {
  const result = await callInlomax('/payelectric', req.body);
  res.status(result.status).json(result.data);
});

// 8. Education
app.post('/api/terminal/buy-education', async (req, res) => {
  const result = await callInlomax('/education', req.body);
  res.status(result.status).json(result.data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Transaction Terminal active on port ${PORT}`));

export default app;