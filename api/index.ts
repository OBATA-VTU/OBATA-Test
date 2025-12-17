import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

// Configuration
const INLOMAX_BASE_URL = 'https://inlomax.com/api'; 
const INLOMAX_API_KEY = process.env.INLOMAX_API_KEY;

app.use(cors({ origin: true }));
app.use(express.json());

// Provider Call Helper - Enhanced for Debugging
const callProvider = async (endpoint: string, payload: any, method: 'GET' | 'POST' = 'POST') => {
    const url = `${INLOMAX_BASE_URL}${endpoint}`;
    try {
        console.log(`[NAKED TEST] INLOMAX ${method} REQ: ${url}`);
        const config = {
            method,
            url,
            data: payload,
            headers: {
                'Authorization': `Token ${INLOMAX_API_KEY}`,
                'Content-Type': 'application/json'
            }
        };
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error: any) {
        const status = error.response?.status || 500;
        const providerErrorData = error.response?.data || error.message;
        console.error(`[NAKED TEST] INLOMAX ERR [${status}]:`, providerErrorData);
        
        return { 
            success: false, 
            error: providerErrorData, 
            status: status,
            fullError: providerErrorData 
        };
    }
};

// --- NAKED TEST ROUTES (Auth Removed) ---

app.get('/api/admin/inlomax-balance', async (req, res) => {
    const result = await callProvider('/user', {}, 'GET');
    res.status(result.status || 200).json(result);
});

app.post('/api/vtu/airtime', async (req, res) => {
    const result = await callProvider('/airtime', req.body);
    res.status(result.status || 200).json(result);
});

app.post('/api/vtu/data', async (req, res) => {
    const result = await callProvider('/data', req.body);
    res.status(result.status || 200).json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;