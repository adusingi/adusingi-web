// @ts-nocheck
import { SendMailClient } from "zeptomail";
import fs from 'fs';

// Load posts data
const posts = JSON.parse(fs.readFileSync('./src/data/posts.json', 'utf8'));
const latestPost = posts[0];

// ZeptoMail configuration
const url = "https://api.zeptomail.com/v1.1/email";
const token = process.env.ZEPTOMAIL_TOKEN;

if (!token) {
  console.error("Error: ZEPTOMAIL_TOKEN environment variable is required");
  process.exit(1);
}

const client = new SendMailClient({url, token});

// Create email template
function createEmailTemplate(post) {
  const postUrl = `https://adusingi.com/blog/${post.slug}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #1e293b;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 10px 0;
        }
        .meta {
            color: #64748b;
            font-size: 14px;
        }
        .content {
            margin-bottom: 30px;
        }
        .content h1 { font-size: 22px; }
        .content h2 { font-size: 20px; }
        .content h3 { font-size: 18px; }
        .content p { margin-bottom: 16px; }
        .content ul, .content ol { margin-bottom: 16px; padding-left: 20px; }
        .content li { margin-bottom: 8px; }
        .content a {
            color: #3b82f6;
            text-decoration: none;
        }
        .content a:hover {
            text-decoration: underline;
        }
        .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 30px;
            font-size: 14px;
            color: #64748b;
        }
        .read-more {
            display: inline-block;
            background-color: #1e293b;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .read-more:hover {
            background-color: #334155;
            text-decoration: none;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${post.title}</h1>
        <div class="meta">
            ${new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            ${post.tags.length > 0 ? ` • ${post.tags.map(t => '#' + t).join(' ')}` : ''}
        </div>
    </div>
    
    <div class="content">
        ${post.content}
    </div>
    
    <a href="${postUrl}" class="read-more">Read full post online</a>
    
    <div class="footer">
        <p>You're receiving this email because you subscribed to Aimable Dusingizimana's newsletter.</p>
        <p>If you'd like to unsubscribe, <a href="mailto:adusingi@mobayilo.com?subject=Unsubscribe">click here</a>.</p>
        <p>© 2024 Aimable Dusingizimana. Building from rural Okayama, Japan.</p>
    </div>
</body>
</html>
  `;
}

// Send test email
async function sendTestEmail() {
  try {
    const emailData = {
      from: {
        address: "noreply@adusingi.com",
        name: "Aimable Dusingizimana"
      },
      to: [
        {
          email_address: {
            address: "adusingi@protonmail.com",
            name: "Aimable Dusingizimana (Test)"
          }
        }
      ],
      subject: `🧪 Test: ${latestPost.title}`,
      htmlbody: createEmailTemplate(latestPost)
    };

    console.log("Sending test email to adusingi@protonmail.com...");
    console.log(`Post: ${latestPost.title}`);
    
    const response = await client.sendMail(emailData);
    console.log("✅ Test email sent successfully!");
    console.log("Response:", response);
    
  } catch (error) {
    console.error("❌ Failed to send test email:");
    console.error(error.message || error);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
  }
}

// Run the test
sendTestEmail();