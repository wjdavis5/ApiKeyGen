import { Env, StoreKeyRequest } from './types';
import { error, json, status } from 'itty-router-extras';
import { Router } from 'itty-router';

const router = Router();

// CORS headers for all responses
const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://localhost:4200',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper function to add CORS headers to any response
function addCorsHeaders(response: Response): Response {
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}

// Helper function to generate a random token
function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}

// Helper function to hash a key with email as salt
async function hashKey(key: string, email: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${key}${email}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode(...hashArray));
}

// Catch-all OPTIONS handler for CORS
router.options('*', () => {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
});

// Request one-time link
router.post('/api/ApiKey/request-link', async (request: Request, env: Env) => {
    const email = await request.json<string>();
    
    if (!email || typeof email !== 'string') {
        return addCorsHeaders(error(400, 'Email is required'));
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
	console.log(expiresAt);
	console.log(token);
    await env.DB.prepare(
        'INSERT INTO OneTimeLinks (email, token, expiresAt) VALUES (?, ?, ?)'
    ).bind(email, token, expiresAt).run();

    const linkUrl = `${env.FRONTEND_URL}/generate-key?token=${token}`;

    // Send email (you'll need to implement this part based on your email service)
    // try {
    //     await fetch(env.EMAIL_SERVICE_URL, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ email, linkUrl })
    //     });
    // } catch (e) {
    //     console.error('Failed to send email:', e);
    //     // Continue even if email fails - we'll return the URL
    // }

    return addCorsHeaders(json({ url: linkUrl }));
});

// Verify one-time link
router.post('/api/ApiKey/verify-link', async (request: Request, env: Env) => {
    const token = await request.json<string>();
    
    if (!token || typeof token !== 'string') {
        return addCorsHeaders(error(400, 'Token is required'));
    }
	console.log(token);
    const link = await env.DB.prepare(
        'SELECT email FROM OneTimeLinks WHERE token = ? AND isUsed = 0 AND expiresAt > datetime("now")'
    ).bind(token).first<{ email: string }>();

    if (!link) {
        return addCorsHeaders(error(404, 'Invalid or expired link'));
    }

    return addCorsHeaders(json({ email: link.email }));
});

// Store API key
router.post('/api/ApiKey/store-key', async (request: Request, env: Env) => {
    const req = await request.json<StoreKeyRequest>();
    
    if (!req?.token || !req?.hashedKey) {
        return addCorsHeaders(error(400, 'Token and hashedKey are required'));
    }

    const link = await env.DB.prepare(
        'SELECT email FROM OneTimeLinks WHERE token = ? AND isUsed = 0 AND expiresAt > datetime("now")'
    ).bind(req.token).first<{ email: string }>();

    if (!link) {
        return addCorsHeaders(error(404, 'Invalid or expired link'));
    }

    const hashedKey = await hashKey(req.hashedKey, link.email);

    try {
        await env.DB.batch([
            env.DB.prepare(
                'UPDATE OneTimeLinks SET isUsed = 1 WHERE token = ?'
            ).bind(req.token),
            env.DB.prepare(
                'INSERT INTO ApiKeys (email, hashedKey) VALUES (?, ?)'
            ).bind(link.email, hashedKey)
        ]);

        return addCorsHeaders(json({ success: true }));
    } catch (e) {
        return addCorsHeaders(error(500, 'Failed to store API key'));
    }
});

// 404 for everything else
router.all('*', () => addCorsHeaders(error(404, 'Not Found')));

export default {
    fetch: router.handle
};
