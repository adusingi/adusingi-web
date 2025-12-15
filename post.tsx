// Import Styles and Fonts
import './style.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/inconsolata/400.css';
import '@fontsource/inconsolata/500.css';
import '@fontsource/inconsolata/600.css';
import '@fontsource/inconsolata/700.css';

// Import Lucide Icons
import { createIcons, Menu, Twitter, Linkedin, Mail } from 'lucide';

// Import posts data
import postsData from './src/data/posts.json' with { type: 'json' };

// Initialize Icons
createIcons({
  icons: {
    Menu,
    Twitter,
    Linkedin,
    Mail
  }
});

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
}

const posts: Post[] = postsData;

document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Menu Toggle ---
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('flex');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
      });
    });
  }

  // --- Get Slug from URL ---
  function getSlugFromUrl(): string | null {
    // Support both query param (?slug=...) and path (/blog/slug)
    const urlParams = new URLSearchParams(window.location.search);
    const querySlug = urlParams.get('slug');

    if (querySlug) return querySlug;

    // Check if path is /blog/slug format
    const path = window.location.pathname;
    const match = path.match(/\/blog\/([^/]+)/);
    return match ? match[1] : null;
  }

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

  // Find post by slug
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    // Post not found
    loadingEl?.classList.add('hidden');
    notFoundEl?.classList.remove('hidden');
    return;
  }

  // --- Render Post ---
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

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
    postTags.innerHTML = post.tags.map(tag => `
      <a href="/blog.html?tag=${tag}" class="px-3 py-1 bg-slate-50 text-slate-600 text-sm font-medium rounded-full hover:bg-slate-100 transition-colors">
        ${tag}
      </a>
    `).join('');
  }

  const postBody = document.getElementById('post-body');
  if (postBody) postBody.innerHTML = post.content;

  // Show post content, hide loading
  loadingEl?.classList.add('hidden');
  postContentEl?.classList.remove('hidden');
});
