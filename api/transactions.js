import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { userId = 'default' } = req.query;
    const key = `user:${userId}:transactions`;

    try {
        if (req.method === 'GET') {
            const transactions = await kv.get(key) || [];
            res.status(200).json(transactions);
        } 
        else if (req.method === 'POST') {
            const transactions = req.body;
            await kv.set(key, transactions);
            res.status(200).json({ success: true, transactions });
        }
        else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
