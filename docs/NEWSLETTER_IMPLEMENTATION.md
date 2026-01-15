# Newsletter Implementation Plan

Complete guide to implementing the email subscription system for the blog using Resend.

## 📊 Current State

- ✅ Email template system (post-template.ts)
- ✅ Manual newsletter sending script (send-post.ts)
- ❌ No subscription form on website
- ❌ No subscriber database
- ❌ Resend not configured

---

## 🎯 Goals

1. Allow visitors to subscribe to blog updates via email
2. Automatically collect and manage subscriber emails
3. Send welcome emails to new subscribers
4. Comply with email marketing regulations (GDPR, CAN-SPAM)
5. Enable easy unsubscribe functionality

---

## 📋 Implementation Phases

### Phase 1: Resend Setup (30 minutes)

#### Step 1.1: Create Resend Account
1. Go to https://resend.com
2. Sign up with your email
3. Verify your email address

#### Step 1.2: Verify Domain
**Important:** You must verify your domain to send emails from `@adusingi.com`

1. In Resend dashboard, go to **Domains**
2. Click "Add Domain"
3. Enter: `adusingi.com`
4. Resend will provide DNS records:
   ```
   TXT record: resend._domainkey.adusingi.com
   MX record (optional but recommended)
   ```
5. Add these records to your domain registrar (e.g., Namecheap, GoDaddy)
6. Wait for verification (usually 5-60 minutes)
7. Verify status in Resend dashboard

#### Step 1.3: Generate API Key
1. Go to **API Keys** in Resend dashboard
2. Click "Create API Key"
3. Name: `Blog Newsletter Production`
4. Permissions: **Full Access** (or limit to Send + Audiences)
5. Copy the key (starts with `re_`)
6. **IMPORTANT:** Save it immediately - you can't see it again!

#### Step 1.4: Update Environment Variables
```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
RESEND_API_KEY=re_your_actual_api_key_here
NEWSLETTER_TO=your-email@example.com  # For testing
```

#### Step 1.5: Create Audience (Mailing List)
1. In Resend dashboard, go to **Audiences**
2. Click "Create Audience"
3. Name: `Blog Subscribers`
4. Note the **Audience ID** (you'll need this later)

#### Step 1.6: Update Email Address
Edit `newsletter/send-post.ts` line 77:
```typescript
from: 'Aimable Dusingizimana <newsletter@adusingi.com>',
```
Change to your verified domain email.

---

### Phase 2: Subscription Form (2 hours)

#### Step 2.1: Create API Endpoint
Create `api/subscribe.ts`:

```typescript
import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = 'your-audience-id-here'; // From Resend dashboard

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validate email
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    // Add to Resend audience
    const { data, error } = await resend.contacts.create({
      email,
      audienceId: AUDIENCE_ID,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    // Send welcome email
    await sendWelcomeEmail(email);

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed!'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

async function sendWelcomeEmail(email: string) {
  // TODO: Implement welcome email (Phase 3)
  return null;
}
```

#### Step 2.2: Create Subscription Form Component
Create `src/components/newsletter-form.ts`:

```typescript
export function initNewsletterForm() {
  const form = document.getElementById('newsletter-form') as HTMLFormElement;
  const input = document.getElementById('newsletter-email') as HTMLInputElement;
  const button = document.getElementById('newsletter-submit') as HTMLButtonElement;
  const message = document.getElementById('newsletter-message') as HTMLDivElement;

  if (!form || !input || !button || !message) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = input.value.trim();

    // Reset message
    message.textContent = '';
    message.className = 'hidden';

    // Validate
    if (!email) {
      showMessage('Please enter your email address', 'error');
      return;
    }

    // Disable form during submission
    button.disabled = true;
    button.textContent = 'Subscribing...';

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('🎉 Thanks for subscribing! Check your email.', 'success');
        input.value = '';
      } else {
        showMessage(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      showMessage('Network error. Please try again.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Subscribe';
    }
  });

  function showMessage(text: string, type: 'success' | 'error') {
    message.textContent = text;
    message.className = type === 'success'
      ? 'text-green-600 text-sm mt-2'
      : 'text-red-600 text-sm mt-2';
  }
}
```

#### Step 2.3: Add Form HTML to Blog Pages
Add to `blog.html` (after posts section, before footer):

```html
<!-- Newsletter Subscription -->
<section class="py-16 bg-slate-50">
  <div class="max-w-4xl mx-auto px-4 md:px-8 text-center">
    <div class="reveal max-w-xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
        Get new posts via email
      </h2>
      <p class="text-lg text-slate-600 mb-8">
        Join fellow builders, developers, and Japan enthusiasts.
        One email per post, no spam, unsubscribe anytime.
      </p>

      <form id="newsletter-form" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          id="newsletter-email"
          type="email"
          placeholder="your@email.com"
          required
          class="flex-1 px-5 py-3 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
        <button
          id="newsletter-submit"
          type="submit"
          class="px-8 py-3 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>

      <div id="newsletter-message" class="hidden mt-3"></div>

      <p class="text-xs text-slate-500 mt-4">
        By subscribing, you agree to receive email updates.
        <a href="/privacy" class="underline hover:text-slate-900">Privacy Policy</a>
      </p>
    </div>
  </div>
</section>
```

Add same form to `post.html` (after post content).

#### Step 2.4: Import Form Component
Update `blog.tsx`:
```typescript
import { initNewsletterForm } from './src/components/newsletter-form.js';

document.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...

  // Initialize newsletter form
  initNewsletterForm();
});
```

Do same for `post.tsx`.

---

### Phase 3: Welcome Email (30 minutes)

Create `newsletter/welcome-template.ts`:

```typescript
export function createWelcomeEmailTemplate(siteUrl: string = 'https://www.adusingi.com'): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Newsletter!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #fafaf9; color: #1e293b;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #0d181d;">
                Welcome! 🎉
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
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

              <a href="${siteUrl}/blog" style="display: inline-block; padding: 14px 32px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 50px;">
                Visit the Blog →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #64748b;">
                Follow me on social media:
              </p>
              <div style="margin-bottom: 20px;">
                <a href="https://x.com/Adusingi" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 14px;">Twitter</a>
                <span style="color: #cbd5e1;">·</span>
                <a href="https://www.linkedin.com/in/aimable-dusingizimana-1929461" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 14px;">LinkedIn</a>
              </div>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © 2025 Aimable Dusingizimana · Based in Okayama, Japan
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #cbd5e1;">
                <a href="${siteUrl}/unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
```

Update `api/subscribe.ts` to send welcome email:
```typescript
import { createWelcomeEmailTemplate } from '../newsletter/welcome-template.js';

async function sendWelcomeEmail(email: string) {
  const html = createWelcomeEmailTemplate();

  await resend.emails.send({
    from: 'Aimable Dusingizimana <newsletter@adusingi.com>',
    to: [email],
    subject: 'Welcome to the Newsletter! 🎉',
    html: html,
  });
}
```

---

### Phase 4: Unsubscribe System (1 hour)

#### Step 4.1: Create Unsubscribe Page
Create `unsubscribe.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribe | Aimable Dusingizimana</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body class="bg-stone-50 text-slate-800">
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm">
      <h1 class="text-3xl font-serif font-semibold text-slate-900 mb-4">
        Unsubscribe
      </h1>
      <p class="text-slate-600 mb-6">
        Sorry to see you go! Enter your email below to unsubscribe from the newsletter.
      </p>

      <form id="unsubscribe-form">
        <input
          id="unsubscribe-email"
          type="email"
          placeholder="your@email.com"
          required
          class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 mb-4"
        />
        <button
          type="submit"
          class="w-full px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
        >
          Unsubscribe
        </button>
      </form>

      <div id="unsubscribe-message" class="hidden mt-4"></div>
    </div>
  </div>

  <script type="module" src="/src/unsubscribe.ts"></script>
</body>
</html>
```

#### Step 4.2: Create Unsubscribe API
Create `api/unsubscribe.ts`:

```typescript
import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = 'your-audience-id-here';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    await resend.contacts.remove({
      email,
      audienceId: AUDIENCE_ID,
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({ error: 'Failed to unsubscribe' });
  }
}
```

---

## 🚀 Quick Start Guide

1. **Resend Setup** (Do this first):
   ```bash
   # 1. Create account at https://resend.com
   # 2. Verify domain
   # 3. Get API key
   # 4. Create audience
   ```

2. **Local Development**:
   ```bash
   # Copy and update .env
   cp .env.example .env

   # Install dependencies (if needed)
   pnpm install @vercel/node

   # Test locally with Vercel CLI
   vercel dev
   ```

3. **Deploy**:
   ```bash
   # Add env vars to Vercel
   vercel env add RESEND_API_KEY

   # Deploy
   vercel --prod
   ```

---

## ✅ Testing Checklist

- [ ] Domain verified in Resend
- [ ] API key works
- [ ] Subscription form submits successfully
- [ ] Email added to Resend audience
- [ ] Welcome email received
- [ ] Unsubscribe works
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] Mobile responsive
- [ ] GDPR notice visible

---

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Audiences API](https://resend.com/docs/api-reference/audiences)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [CAN-SPAM Compliance](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)

---

## 💡 Future Enhancements

- [ ] Double opt-in verification
- [ ] Subscriber count display
- [ ] Email preferences page
- [ ] Automated weekly digest
- [ ] Referral system
- [ ] Analytics dashboard
