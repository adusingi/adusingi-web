# Newsletter System with ZeptoMail

## ✅ Test Results

The ZeptoMail integration is working, but you need to **verify your sender domain**:

1. In ZeptoMail dashboard → Settings → Sender Domains
2. Add and verify `adusingi.com` or your preferred sender domain
3. Then you can send emails

## 📧 Newsletter Usage

### 1. Send Test Email (Current Issue)
```bash
./scripts/send-test-email.sh
```
*Note: Will work once sender domain is verified*

### 2. Send Newsletter for Specific Post
```bash
# Send to yourself only
node scripts/send-newsletter.js life-in-rural-japan

# Send to multiple recipients
node scripts/send-newsletter.js life-in-rural-japan user1@example.com,user2@example.com
```

### 3. Available Posts
- `life-in-rural-japan` - "Code, Craft & Culture: Building from Rural Japan" (latest)
- `building-minimal-blog-vite` - "Building a Minimal Blog with Vite and TypeScript"
- `welcome-to-my-blog` - "Welcome to My Blog"

## 🚀 Automatic Newsletter Process

### Option 1: Simple npm Commands (Recommended)

Add these to your `package.json`:

```json
{
  "scripts": {
    "newsletter:test": "./scripts/send-test-email.sh",
    "newsletter:send": "node scripts/send-newsletter.js",
    "newsletter:latest": "node scripts/send-newsletter.js life-in-rural-japan"
  }
}
```

**Usage:**
```bash
# Test email setup
pnpm newsletter:test

# Send latest post to yourself
pnpm newsletter:latest

# Send specific post
pnpm newsletter:send post-slug
```

### Option 2: Automated on New Post

Create a workflow that:
1. Detects new markdown file in `/posts`
2. Builds posts (`pnpm build:posts`)
3. Offers to send newsletter automatically

```bash
# One-command workflow for new posts
pnpm newsletter:new post-slug
```

### Option 3: Subscriber Management

For multiple subscribers, create:

1. **Simple CSV file** (`subscribers.csv`):
```csv
email,name
user1@example.com,John Doe
user2@example.com,Jane Smith
```

2. **Subscriber script** that reads CSV and sends to all:
```bash
pnpm newsletter:send-to-all post-slug
```

## 🛠️ Environment Setup

Create `.env` file:
```env
ZEPTOMAIL_TOKEN=Zoho-enczapikey your_token_here
```

## 📋 Workflow for New Blog Posts

1. **Write post**: Add new `YYYY-MM-DD-slug.md` to `/posts`
2. **Build**: `pnpm build:posts` (generates JSON)
3. **Preview**: `pnpm dev` and review locally
4. **Send newsletter**: 
   ```bash
   pnpm newsletter:send post-slug
   ```
5. **Deploy**: `vercel --prod` (with your permission)

## 🎯 Benefits of This Approach

- **Zero dependencies**: Uses existing ZeptoMail account
- **Full control**: You own the email list and content
- **Cost-effective**: Only pay for emails you send
- **Simple**: No external newsletter services needed
- **Integrated**: Uses your existing blog data and styling

Would you like me to implement any of these automatic processes or help you set up the subscriber management?