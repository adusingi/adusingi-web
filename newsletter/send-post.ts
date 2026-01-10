import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import { createPostEmailTemplate } from './post-template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
}

async function sendPostNewsletter() {
  // Get slug from command line argument
  const slug = process.argv[2];

  if (!slug) {
    console.error('❌ Error: Please provide a post slug');
    console.log('\nUsage: pnpm run newsletter:send <post-slug>');
    console.log('Example: pnpm run newsletter:send welcome-to-my-blog');
    process.exit(1);
  }

  // Check for Resend API key
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: RESEND_API_KEY environment variable not set');
    console.log('\nPlease set your Resend API key:');
    console.log('  export RESEND_API_KEY="re_..."');
    console.log('  Or add it to your .env file');
    process.exit(1);
  }

  // Load posts.json
  const postsPath = path.join(__dirname, '../src/data/posts.json');
  if (!fs.existsSync(postsPath)) {
    console.error('❌ Error: posts.json not found');
    console.log('\nRun "pnpm run build:posts" first to generate posts.json');
    process.exit(1);
  }

  const postsData = fs.readFileSync(postsPath, 'utf-8');
  const posts: Post[] = JSON.parse(postsData);

  // Find the post
  const post = posts.find(p => p.slug === slug);
  if (!post) {
    console.error(`❌ Error: Post with slug "${slug}" not found`);
    console.log('\nAvailable posts:');
    posts.forEach(p => console.log(`  - ${p.slug}`));
    process.exit(1);
  }

  console.log(`\n📧 Preparing to send newsletter for: "${post.title}"`);
  console.log(`   Date: ${post.date}`);
  console.log(`   Tags: ${post.tags.join(', ')}`);

  // Create email HTML
  const html = createPostEmailTemplate(post);

  // Initialize Resend
  const resend = new Resend(apiKey);

  // Get recipient email (you can modify this to use a mailing list)
  const toEmail = process.env.NEWSLETTER_TO || 'your-email@example.com';

  try {
    console.log(`\n📤 Sending newsletter to: ${toEmail}`);

    const { data, error } = await resend.emails.send({
      from: 'Aimable Dusingizimana <newsletter@adusingi.com>', // Update with your verified domain
      to: [toEmail],
      subject: post.title,
      html: html,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      process.exit(1);
    }

    console.log('\n✅ Newsletter sent successfully!');
    console.log(`   Email ID: ${data?.id}`);
    console.log(`\n🔗 Post URL: https://www.adusingi.com/blog/${post.slug}`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
sendPostNewsletter();
