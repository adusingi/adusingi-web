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
import {
  createIcons,
  Menu,
  Loader2,
  AlertCircle,
  Pin
} from 'lucide';

// Import Shared Logic
import { setupMobileMenu } from './src/lib/ui';

// Import newsletter form
import { initNewsletterForm } from './src/components/newsletter-form.js';
import { formatDate } from './src/lib/utils';

// Initialize Icons
createIcons({
  icons: {
    Menu,
    Loader2,
    AlertCircle,
    Pin
  }
});

// --- Global State ---
interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  pinned?: boolean;
}

interface PaginatedResponse {
  posts: Post[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
  };
}

// --- DOM Elements ---
const postsContainer = document.getElementById('posts-container');
const noPostsMessage = document.getElementById('no-posts');
const paginationContainer = document.getElementById('pagination-container');
const tagFilter = document.getElementById('tag-filter');

// --- State ---
let currentPage = 1;
let totalPages = 1;
let currentTag = 'all';
let allTags: string[] = [];

// --- Pagination Functions ---
async function loadPage(page: number, tag: string = 'all'): Promise<void> {
  if (!postsContainer) return;

  // Update state
  currentPage = page;
  currentTag = tag;

  // Show loader
  postsContainer.innerHTML = `
    <div class="flex flex-col items-center justify-center py-20 text-slate-400">
      <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-4"></i>
      <p>Loading posts...</p>
    </div>
  `;
  createIcons({ icons: { Loader2 } });

  try {
    const isTagFiltered = tag !== 'all';
    let response;

    if (isTagFiltered) {
      // For tag filtering, we need to load all posts and filter client-side
      const allResponse = await fetch('/data/posts-all.json');
      if (!allResponse.ok) throw new Error('Failed to load posts');
      const allPostsData: Post[] = await allResponse.json();
      
      const filteredPosts = allPostsData.filter(post => post.tags.includes(tag));
      
      // Simple client-side pagination for filtered results
      const PAGE_SIZE = 6;
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      renderPosts(paginatedPosts);
      updatePaginationUI(page, Math.ceil(filteredPosts.length / PAGE_SIZE), tag);
    } else {
      // For non-filtered view, use server-side pagination
      const fileName = page === 1 ? '/data/posts.json' : `/data/posts-page-${page}.json`;
      response = await fetch(fileName);
      
      if (!response.ok) throw new Error('Failed to load posts');
      const data: PaginatedResponse = await response.json();
      
      renderPosts(data.posts);
      updatePaginationUI(data.pagination.current, data.pagination.total, tag);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    postsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 text-red-500">
        <i data-lucide="alert-circle" class="w-10 h-10 mb-4"></i>
        <p class="text-lg font-medium">Unable to load blog posts.</p>
        <p class="text-sm text-slate-500 mt-2">Please try refreshing the page.</p>
      </div>
    `;
    createIcons({ icons: { AlertCircle } });
  }
}

function renderPosts(posts: Post[]) {
  if (!postsContainer || !noPostsMessage) return;

  if (posts.length === 0) {
    postsContainer.innerHTML = '';
    noPostsMessage.classList.remove('hidden');
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
    }
    return;
  }

  // Sanitize post data to prevent XSS
  const sanitizedPosts = posts.map(post => ({
    ...post,
    title: post.title.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    description: post.description.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    tags: post.tags.map(tag => tag.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
  }));

  postsContainer.innerHTML = sanitizedPosts.map(post => `
    <article class="reveal bg-white border border-slate-100 rounded-2xl p-6 md:p-8 hover:border-slate-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      ${post.pinned ? `
        <div class="absolute top-0 right-0 p-3 bg-slate-50 border-b border-l border-slate-100 rounded-bl-2xl">
          <i data-lucide="pin" class="w-4 h-4 text-blue-600 fill-blue-600/10"></i>
        </div>
      ` : ''}
      <a href="/post.html?slug=${encodeURIComponent(post.slug)}" class="block group">
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

  // Hide no posts message
  noPostsMessage.classList.add('hidden');

  // Initialize icons for newly rendered posts
  createIcons({ icons: { Pin } });
}

function updatePaginationUI(current: number, total: number, tag: string = 'all') {
  if (!paginationContainer) return;

  totalPages = total;

  if (total <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  const paginationHTML = `
    <nav class="flex items-center space-x-2">
      <!-- Previous Button -->
      <button 
        onclick="loadPage(${current - 1}, '${tag}')"
        class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        ${current === 1 ? 'disabled' : ''}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <!-- Page Numbers -->
      ${generatePageNumbers(current, total).map(pageNum => {
        if (pageNum === '...') {
          return '<span class="px-3 py-2 text-slate-400">...</span>';
        }
        return `
          <button 
            onclick="loadPage(${pageNum}, '${tag}')"
            class="px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              pageNum === current 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
            }"
          >
            ${pageNum}
          </button>
        `;
      }).join('')}

      <!-- Next Button -->
      <button 
        onclick="loadPage(${current + 1}, '${tag}')"
        class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        ${current === total ? 'disabled' : ''}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </nav>
  `;

  paginationContainer.innerHTML = paginationHTML;
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    if (current <= 3) {
      for (let i = 2; i <= 4; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 2) {
      pages.push('...');
      for (let i = total - 3; i <= total - 1; i++) {
        pages.push(i);
      }
      pages.push(total);
    } else {
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    }
  }

  return pages;
}

// --- Tag Filtering ---
async function setupTagFilter() {
  if (!tagFilter) return;

  try {
    // Load all posts to extract tags
    const response = await fetch('/data/posts-all.json');
    if (!response.ok) return;
    
    const allPostsData: Post[] = await response.json();
    
    // Extract unique tags
    const tagSet = new Set<string>();
    allPostsData.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    
    allTags = Array.from(tagSet).sort();
    
    // Clear existing buttons except "All Posts"
    const allButton = tagFilter.querySelector('[data-tag="all"]');
    tagFilter.innerHTML = '';
    if (allButton) {
      tagFilter.appendChild(allButton);
    }
    
    // Add tag buttons
    allTags.forEach(tag => {
      const button = document.createElement('button');
      button.className = 'tag-btn px-4 py-2 text-sm font-medium rounded-full transition-colors bg-slate-50 text-slate-700 hover:bg-slate-100';
      button.setAttribute('data-tag', tag);
      button.textContent = tag;
      tagFilter.appendChild(button);
    });

    // Add click handlers
    const tagButtons = document.querySelectorAll('.tag-btn');
    tagButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        if (tag) {
          updateTagButtons(tag);
          loadPage(1, tag);
        }
      });
    });
  } catch (error) {
    console.error('Error setting up tag filter:', error);
  }
}

function updateTagButtons(activeTag: string) {
  const tagButtons = document.querySelectorAll('.tag-btn');
  tagButtons.forEach(btn => {
    const tag = btn.getAttribute('data-tag');
    if (tag === activeTag) {
      btn.classList.remove('bg-slate-50', 'text-slate-700', 'hover:bg-slate-100');
      btn.classList.add('bg-slate-900', 'text-white');
    } else {
      btn.classList.remove('bg-slate-900', 'text-white');
      btn.classList.add('bg-slate-50', 'text-slate-700', 'hover:bg-slate-100');
    }
  });
}

// --- Reveal Animation ---
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

// --- Initialize ---
document.addEventListener('DOMContentLoaded', async () => {
  // Setup mobile menu
  setupMobileMenu();

  // Setup tag filter first to get all tags
  await setupTagFilter();

  // Load first page
  await loadPage(1, 'all');

  // Initialize newsletter form
  initNewsletterForm();

  // Reveal elements logic for static parts
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => revealObserver.observe(el));
});

// Make loadPage globally available for onclick handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).loadPage = loadPage;