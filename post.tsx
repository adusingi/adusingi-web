// Import Styles and Fonts
import './style.css';
import '@fontsource/inconsolata/400.css';
import '@fontsource/inconsolata/500.css';
import '@fontsource/inconsolata/600.css';
import '@fontsource/inconsolata/700.css';
import '@fontsource/noto-serif-jp/400.css';

// Import Shared Logic
import { getSlugFromUrl, formatDate } from './src/lib/utils';

// Import newsletter form
import { initNewsletterForm } from './src/components/newsletter-form.js';

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
}

document.addEventListener('DOMContentLoaded', async () => {
  // --- Get Slug from URL ---
  const slug = getSlugFromUrl();

  const loadingEl = document.getElementById('loading');
  const notFoundEl = document.getElementById('not-found');
  const postContentEl = document.getElementById('post-content');

  if (!slug) {
    // No slug provided, show not found
    loadingEl?.classList.add('hidden');
    notFoundEl?.classList.remove('hidden');
    return;
  }

  // --- Fetch Post Data ---
  let post: Post | null = null;

  try {
    const response = await fetch(`/data/posts/${slug}.json`);
    if (response.ok) {
      post = await response.json();
    } else {
      console.error('Post not found:', slug);
    }
  } catch (err) {
    console.error('Error loading post:', err);
  }

  if (!post) {
    // Post not found
    loadingEl?.classList.add('hidden');
    notFoundEl?.classList.remove('hidden');
    return;
  }

  // --- Render Post ---

  // Update page title and meta tags
  document.title = `${post.title} | Aimable Dusingizimana`;

  const pageDescription = document.getElementById('page-description');
  if (pageDescription) pageDescription.setAttribute('content', post.description);

  const ogUrl = document.getElementById('og-url');
  if (ogUrl) ogUrl.setAttribute('content', `https://www.adusingi.com/blog/${post.slug}`);

  const ogTitle = document.getElementById('og-title');
  if (ogTitle) ogTitle.setAttribute('content', post.title);

  const ogDescription = document.getElementById('og-description');
  if (ogDescription) ogDescription.setAttribute('content', post.description);

  const twitterTitle = document.getElementById('twitter-title');
  if (twitterTitle) twitterTitle.setAttribute('content', post.title);

  const twitterDescription = document.getElementById('twitter-description');
  if (twitterDescription) twitterDescription.setAttribute('content', post.description);

  // Render post content
  const postTitle = document.getElementById('post-title');
  if (postTitle) postTitle.textContent = post.title;

  const postDate = document.getElementById('post-date');
  if (postDate) postDate.textContent = formatDate(post.date);

  const postDescription = document.getElementById('post-description');
  if (postDescription) postDescription.textContent = post.description;

  const postTags = document.getElementById('post-tags');
  if (postTags) {
    // Sanitize tag names to prevent XSS
    const sanitizedTags = post.tags.map(tag =>
      tag.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    );

    postTags.innerHTML = sanitizedTags.map(tag => `
      <a href="/blog.html?tag=${encodeURIComponent(tag)}" class="px-2 py-0.5 border border-ink/30 text-ink/70 hover:border-ink hover:text-ink transition-colors">
        ${tag}
      </a>
    `).join('');
  }

  const postBody = document.getElementById('post-body');
  if (postBody) postBody.innerHTML = post.content;

  // Show post content, hide loading
  loadingEl?.classList.add('hidden');
  postContentEl?.classList.remove('hidden');

  // Initialize newsletter form
  initNewsletterForm();
});
