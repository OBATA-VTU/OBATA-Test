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

const db = admin.firestore();

// Configuration
const INLOMAX_BASE_URL = 'https://inlomax.com/api'; // Hardcoded base URL for provider
const INLOMAX_API_KEY = process.env.INLOMAX_API_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

app.use(cors({ origin: true }));
app.use(express.json());

// Middleware: Verify Firebase ID Token
const verifyAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
};

// Provider Call Helper
const callProvider = async (endpoint: string, payload: any) => {
    try {
        // Log for debugging
        console.log(`Calling Provider: ${INLOMAX_BASE_URL}${endpoint}`);
        
        const response = await axios.post(`${INLOMAX_BASE_URL}${endpoint}`, payload, {
            headers: {
                'Authorization': `Token ${INLOMAX_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error("Provider Error:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const providerError = error.response?.data?.message || error.response?.data?.error || error.message;
        
        return { 
            success: false, 
            error: providerError,
            status: status
        };
    }
};

// --- VTU Routes ---

app.post('/vtu/airtime', verifyAuth, async (req, res) => {
    const result = await callProvider('/airtime', req.body);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    res.json(result.data);
});

app.post('/vtu/data', verifyAuth, async (req, res) => {
    const result = await callProvider('/data', req.body);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    res.json(result.data);
});

app.post('/vtu/cable', verifyAuth, async (req, res) => {
    const result = await callProvider('/subcable', req.body);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    res.json(result.data);
});

app.post('/vtu/electricity', verifyAuth, async (req, res) => {
    const result = await callProvider('/payelectric', req.body);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    res.json(result.data);
});

app.post('/vtu/verify/meter', verifyAuth, async (req, res) => {
    const result = await callProvider('/validatemeter', req.body);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    res.json(result.data);
});

app.post('/vtu/verify/cable', verifyAuth, async (req, res) => {
    const result = await callProvider('/validatecable', req.body);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    res.json(result.data);
});

// --- Banking Routes (Paystack) ---

app.get('/misc/banks', verifyAuth, async (req, res) => {
    try {
        const response = await axios.get('https://api.paystack.co/bank', {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
        });
        res.json({ success: true, data: response.data.data });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch banks' });
    }
});

app.get('/misc/resolve-account', verifyAuth, async (req, res) => {
    const { account_number, bank_code } = req.query;
    try {
        const response = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
        });
        res.json({ success: true, data: response.data.data });
    } catch (error: any) {
        res.status(400).json({ error: 'Could not resolve account' });
    }
});

app.get('/payment/verify/:reference', verifyAuth, async (req, res) => {
    const reference = req.params.reference;
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
        });
        
        if (response.data.status && response.data.data.status === 'success') {
             res.json({ success: true, data: response.data.data });
        } else {
             res.status(400).json({ success: false, message: "Transaction not successful" });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;