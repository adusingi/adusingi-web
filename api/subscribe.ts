import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Create Redis instance strictly from env vars
// If vars are missing, or initialization fails, redis will be null
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.warn('Failed to initialize Redis:', error);
  redis = null;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  durationInSeconds: number = 3600
): Promise<RateLimitResult> {
  if (!redis) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + durationInSeconds * 1000,
    };
  }

  const key = `rate_limit:${identifier}`;

  try {
    const requests = await redis.incr(key);
    if (requests === 1) {
      await redis.expire(key, durationInSeconds);
    }
    const ttl = await redis.ttl(key);

    return {
      success: requests <= limit,
      limit,
      remaining: Math.max(0, limit - requests),
      reset: Date.now() + ttl * 1000,
    };
  } catch {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + durationInSeconds * 1000,
    };
  }
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limiting
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimit = await checkRateLimit(ip.toString());

    res.setHeader('X-RateLimit-Limit', rateLimit.limit);
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', rateLimit.reset);

    if (!rateLimit.success) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
  } catch (rateLimitError) {
    console.error('Rate limit check failed (failing open):', rateLimitError);
    // Continue execution if rate limiting fails
  }

  const { email } = req.body;

  // Validate email
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not defined');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const resend = new Resend(apiKey);

  try {
    // Add contact to Resend
    // Note: Resend will handle duplicate emails automatically
    const { error } = await resend.contacts.create({
      email: email,
      unsubscribed: false,
    });

    if (error) {
      console.error('Resend error:', error);

      // Check if email already exists
      if (error.message && error.message.includes('already exists')) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed!',
        });
      }

      return res.status(500).json({
        error: 'Failed to subscribe. Please try again later.'
      });
    }

    // Send welcome email
    await sendWelcomeEmail(email, resend);

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed! Check your email.',
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.'
    });
  }
}

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

async function sendWelcomeEmail(email: string, resend: Resend) {
  try {
    // Simple welcome email for now
    const { error } = await resend.emails.send({
      from: 'Aimable Dusingizimana <newsletter@adusingi.com>',
      to: [email],
      subject: 'Welcome to the Newsletter! 🎉',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #fafaf9; color: #1e293b;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

    <!-- Header -->
    <div style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #0d181d;">
        Welcome! 🎉
      </h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px;">
      <p style="margin: 0 0 20px; font-size: 16px; color: #475569; line-height: 1.7;">
        Thanks for subscribing to my newsletter! I'm Aimable Dusingizimana,
        a builder and developer based in rural Okayama, Japan.
      </p>

      <p style="margin: 0 0 20px; font-size: 16px; color: #475569; line-height: 1.7;">
        Here's what you can expect:
      </p>

      <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; color: #475569; line-height: 1.8;">
        <li>New blog posts about tech, Japan, and building digital products</li>
        <li>Insights from living and working in rural Japan</li>
        <li>Tai-Chi practice reflections (太極拳)</li>
        <li>No spam - only quality content when I publish</li>
      </ul>

      <p style="margin: 0 0 30px; font-size: 16px; color: #475569; line-height: 1.7;">
        Check out my recent posts on the blog:
      </p>

      <div style="text-align: center;">
        <a href="https://www.adusingi.com/blog" style="display: inline-block; padding: 14px 32px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 50px;">
          Visit the Blog →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #64748b;">
        Follow me on social media:
      </p>
      <div style="margin-bottom: 20px;">
        <a href="https://x.com/Adusingi" style="color: #64748b; text-decoration: none; margin: 0 8px;">Twitter</a>
        <span style="color: #cbd5e1;">·</span>
        <a href="https://www.linkedin.com/in/aimable-dusingizimana-1929461" style="color: #64748b; text-decoration: none; margin: 0 8px;">LinkedIn</a>
      </div>
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
        © 2025 Aimable Dusingizimana · Based in Okayama, Japan
      </p>
      <p style="margin: 12px 0 0; font-size: 11px; color: #cbd5e1;">
        <a href="https://www.adusingi.com/unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      // Don't fail the subscription if welcome email fails
    }
  } catch (error) {
    console.error('Welcome email error:', error);
    // Don't fail the subscription if welcome email fails
  }
}
