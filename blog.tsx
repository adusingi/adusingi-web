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

  // --- Reveal on Scroll Animation (defined early so renderPosts can use it) ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  // --- Render Posts ---
  const postsContainer = document.getElementById('posts-container');
  const noPostsMessage = document.getElementById('no-posts');

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function renderPosts(filteredPosts: Post[]) {
    if (!postsContainer || !noPostsMessage) return;

    if (filteredPosts.length === 0) {
      postsContainer.innerHTML = '';
      noPostsMessage.classList.remove('hidden');
      return;
    }

    noPostsMessage.classList.add('hidden');

    postsContainer.innerHTML = filteredPosts.map(post => `
      <article class="reveal bg-white border border-slate-100 rounded-2xl p-6 md:p-8 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
        <a href="/post.html?slug=${post.slug}" class="block group">
          <div class="flex items-center gap-4 mb-3">
            <time class="text-sm font-mono text-slate-400">${formatDate(post.date)}</time>
            <div class="flex gap-2">
              ${post.tags.map(tag => `
                <span class="px-2 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full">
                  ${tag}
                </span>
              `).join('')}
            </div>
          </div>

          <h2 class="text-2xl md:text-3xl font-serif font-semibold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
            ${post.title}
          </h2>

          <p class="text-slate-700 leading-relaxed mb-4">
            ${post.description}
          </p>

          <span class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 group-hover:text-slate-900 group-hover:gap-3 transition-all">
            Read more
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </a>
      </article>
    `).join('');

    // Re-observe reveal elements
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- Extract All Tags ---
  const allTags = new Set<string>();
  posts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag));
  });

  // --- Render Tag Filter ---
  const tagFilter = document.getElementById('tag-filter');
  if (tagFilter) {
    const sortedTags = Array.from(allTags).sort();
    sortedTags.forEach(tag => {
      const button = document.createElement('button');
      button.className = 'tag-btn px-4 py-2 text-sm font-medium rounded-full transition-colors bg-slate-50 text-slate-700 hover:bg-slate-100';
      button.dataset.tag = tag;
      button.textContent = tag;
      tagFilter.appendChild(button);
    });
  }

  // --- Tag Filtering ---
  function filterByTag(tag: string) {

    // Update active button styles
    const tagButtons = document.querySelectorAll('.tag-btn');
    tagButtons.forEach(btn => {
      if (btn.getAttribute('data-tag') === tag) {
        btn.classList.remove('bg-slate-50', 'text-slate-700', 'hover:bg-slate-100');
        btn.classList.add('bg-slate-900', 'text-white');
      } else {
        btn.classList.remove('bg-slate-900', 'text-white');
        btn.classList.add('bg-slate-50', 'text-slate-700', 'hover:bg-slate-100');
      }
    });

    // Filter posts
    const filteredPosts = tag === 'all'
      ? posts
      : posts.filter(post => post.tags.includes(tag));

    renderPosts(filteredPosts);
  }

  // Add click handlers to tag buttons
  const tagButtons = document.querySelectorAll('.tag-btn');
  tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      if (tag) filterByTag(tag);
    });
  });

  // Initial render
  renderPosts(posts);

  // Observe any existing reveal elements in the static HTML
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => revealObserver.observe(el));
});
