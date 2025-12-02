import { kv } from '@vercel/kv';
import crypto from 'crypto';

function hashPin(pin, salt) {
    return crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('hex');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action } = req.query;

    try {
        // Register new user
        if (req.method === 'POST' && action === 'register') {
            const { username, pin } = req.body;
            
            if (!username || !pin || pin.length < 4) {
                return res.status(400).json({ error: 'Username and PIN (min 4 digits) required' });
            }

            const existingUser = await kv.get(`user:${username}`);
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            const salt = crypto.randomBytes(16).toString('hex');
            const hashedPin = hashPin(pin, salt);
            
            await kv.set(`user:${username}`, {
                username,
                salt,
                hashedPin,
                createdAt: new Date().toISOString()
            });

            // Create session token
            const sessionToken = crypto.randomBytes(32).toString('hex');
            await kv.set(`session:${sessionToken}`, username, { ex: 86400 * 7 }); // 7 days

            return res.status(200).json({ 
                success: true, 
                username,
                sessionToken 
            });
        }

        // Login
        if (req.method === 'POST' && action === 'login') {
            const { username, pin } = req.body;
            
            if (!username || !pin) {
                return res.status(400).json({ error: 'Username and PIN required' });
            }

            const user = await kv.get(`user:${username}`);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const hashedPin = hashPin(pin, user.salt);
            if (hashedPin !== user.hashedPin) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Create session token
            const sessionToken = crypto.randomBytes(32).toString('hex');
            await kv.set(`session:${sessionToken}`, username, { ex: 86400 * 7 }); // 7 days

            return res.status(200).json({ 
                success: true, 
                username,
                sessionToken 
            });
        }

        // Verify session
        if (req.method === 'GET' && action === 'verify') {
            const { token } = req.query;
            
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const username = await kv.get(`session:${token}`);
            if (!username) {
                return res.status(401).json({ error: 'Invalid or expired session' });
            }

            return res.status(200).json({ 
                success: true, 
                username 
            });
        }

        // Logout
        if (req.method === 'POST' && action === 'logout') {
            const { token } = req.body;
            
            if (token) {
                await kv.del(`session:${token}`);
            }

            return res.status(200).json({ success: true });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
