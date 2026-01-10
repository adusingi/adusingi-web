interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
}

export function createPostEmailTemplate(post: Post, siteUrl: string = 'https://www.adusingi.com'): string {
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #fafaf9; color: #1e293b;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #0d181d; line-height: 1.2;">
                Aimable Dusingizimana
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #64748b; font-style: italic;">
                Code, Craft & Culture from rural Japan
              </p>
            </td>
          </tr>

          <!-- Post Title -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <h2 style="margin: 0; font-size: 32px; font-weight: 600; color: #0f172a; line-height: 1.3;">
                ${post.title}
              </h2>
            </td>
          </tr>

          <!-- Post Meta -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <p style="margin: 0; font-size: 14px; color: #64748b; font-family: 'Courier New', monospace;">
                ${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div style="margin-top: 12px;">
                ${post.tags.map(tag => `
                  <span style="display: inline-block; padding: 4px 12px; margin-right: 8px; margin-bottom: 8px; background-color: #f1f5f9; color: #475569; font-size: 12px; font-weight: 500; border-radius: 16px;">
                    ${tag}
                  </span>
                `).join('')}
              </div>
            </td>
          </tr>

          <!-- Post Description -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 18px; color: #334155; line-height: 1.6;">
                ${post.description}
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <a href="${postUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 50px; transition: background-color 0.3s;">
                Read Full Post →
              </a>
            </td>
          </tr>

          <!-- Preview Content (first paragraph or excerpt) -->
          <tr>
            <td style="padding: 0 40px 40px; border-top: 1px solid #e2e8f0;">
              <div style="margin-top: 30px; font-size: 16px; color: #475569; line-height: 1.7;">
                ${extractExcerpt(post.content, 300)}
              </div>
              <p style="margin-top: 20px;">
                <a href="${postUrl}" style="color: #1d4ed8; text-decoration: none; font-weight: 500;">
                  Continue reading on the blog →
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #64748b;">
                Thanks for reading! Follow me on social media:
              </p>
              <div style="margin-bottom: 20px;">
                <a href="https://x.com/Adusingi" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 14px;">
                  Twitter
                </a>
                <span style="color: #cbd5e1;">·</span>
                <a href="https://www.linkedin.com/in/aimable-dusingizimana-1929461" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 14px;">
                  LinkedIn
                </a>
                <span style="color: #cbd5e1;">·</span>
                <a href="${siteUrl}/contact" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 14px;">
                  Contact
                </a>
              </div>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © 2025 Aimable Dusingizimana · Based in Okayama, Japan
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

// Helper function to extract plain text excerpt from HTML
function extractExcerpt(html: string, maxLength: number = 300): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  if (text.length <= maxLength) {
    return text;
  }

  // Truncate at last complete word before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}
