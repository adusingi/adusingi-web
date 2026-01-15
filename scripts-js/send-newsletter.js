import { SendMailClient } from "zeptomail";
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Load posts data (read from individual post files to get full content)
const posts = fs.readdirSync('./public/data/posts/', { withFileTypes: true })
  .filter(dirent => dirent.isFile() && dirent.name.endsWith('.json'))
  .map(dirent => {
    const post = JSON.parse(fs.readFileSync(`./public/data/posts/${dirent.name}`, 'utf8'));
    return post;
  });

// ZeptoMail configuration
const url = "https://api.zeptomail.com/v1.1/email";
const token = process.env.ZEPTOMAIL_TOKEN;

if (!token) {
  console.error("Error: ZEPTOMAIL_TOKEN environment variable is required");
  process.exit(1);
}

const client = new SendMailClient({url, token});

function createEmailTemplate(post) {
  const postUrl = `https://adusingi.com/blog/${post.slug}`;
  const tagsHtml = post.tags.map(tag => 
    `<span style="display: inline-block; background-color: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 100px; font-size: 12px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">
      ${tag}
    </span>`
  ).join('');

  const imgMatch = post.content.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
  const headerImage = imgMatch ? imgMatch[1] : null;
  const imageHtml = headerImage ? `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 0;">
          <img src="${headerImage}" alt="Post image" style="width: 100%; height: auto; display: block;">
        </td>
      </tr>
    </table>
  ` : '';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>New Post: ${post.title}</title>
</head>
<body style="margin: 0; padding: 40px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; max-width: 600px;">
          <tr>
            <td style="padding: 48px 48px 0 48px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <span style="color: #94a3b8; font-size: 14px; font-weight: 500; margin-right: 16px;">${new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <div style="display: inline-block; vertical-align: middle;">
                      ${tagsHtml}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 48px 32px 48px;">
              <h1 style="margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 32px; line-height: 1.2; color: #0f172a; font-weight: normal; margin-bottom: 24px;">
                ${post.title}
              </h1>
              ${imageHtml}
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
                ${post.description}
              </p>
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${postUrl}" style="text-decoration: none; color: #334155; font-size: 16px; font-weight: 500; display: inline-block;">
                      Read more <span style="margin-left: 4px;">&rsaquo;</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px 48px 48px; border-top: 1px solid #e2e8f0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
                    You're receiving this email because you subscribed to Aimable Dusingizimana's newsletter.<br/>
                    If you'd like to unsubscribe, <a href="mailto:adusingi@mobayilo.com?subject=Unsubscribe" style="color: #64748b; text-decoration: underline;">click here</a>.<br/>
                    © 2024 Aimable Dusingizimana. Building from rural Okayama, Japan.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Send newsletter for a specific post
export async function sendNewsletter(postSlug, recipientEmails = null) {
  try {
    const post = posts.find(p => p.slug === postSlug);
    
    if (!post) {
      throw new Error(`Post with slug "${postSlug}" not found`);
    }

    // Default recipient (you)
    const recipients = recipientEmails || ["adusingi@mobayilo.com"];
    
    const emailData = {
      from: {
        address: "noreply@mobayilo.com",
        name: "Aimable Dusingizimana"
      },
      to: recipients.map(email => ({
        email_address: {
          address: email,
          name: email.includes("adusingi") ? "Aimable Dusingizimana" : "Subscriber"
        }
      })),
      subject: `📝 ${post.title}`,
      htmlbody: createEmailTemplate(post)
    };

    console.log(`Sending newsletter for post: ${post.title}`);
    console.log(`Recipients: ${recipients.join(', ')}`);
    
    const response = await client.sendMail(emailData);
    console.log("✅ Newsletter sent successfully!");
    console.log("Response:", response);
    
    return response;
    
  } catch (error) {
    console.error("❌ Failed to send newsletter:");
    console.error(error.message || error);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
    throw error;
  }
}

// CLI usage: node scripts/send-newsletter.js <post-slug> [email1,email2,...]
if (import.meta.url === `file://${process.argv[1]}`) {
  const postSlug = process.argv[2];
  const recipients = process.argv[3] ? process.argv[3].split(',') : null;
  
  if (!postSlug) {
    console.error("Usage: node scripts/send-newsletter.js <post-slug> [email1,email2,...]");
    console.error("Example: node scripts/send-newsletter.js life-in-rural-japan");
    console.error("Example: node scripts/send-newsletter.js life-in-rural-japan user1@example.com,user2@example.com");
    process.exit(1);
  }
  
  sendNewsletter(postSlug, recipients).catch(console.error);
}