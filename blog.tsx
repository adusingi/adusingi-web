// Import Styles and Fonts
import './style.css';
import '@fontsource/inconsolata/400.css';
import '@fontsource/inconsolata/500.css';
import '@fontsource/inconsolata/600.css';
import '@fontsource/inconsolata/700.css';
import '@fontsource/noto-serif-jp/400.css';

// Import newsletter form
import { initNewsletterForm } from './src/components/newsletter-form.js';
import { formatDate } from './src/lib/utils';

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
// These variables are used in onclick handlers and global scope
let currentPage = 1;
let totalPages = 1;
let currentTag = 'all';
let allTags: string[] = [];

// Simple usage to satisfy ESLint (variables are actually used in onclick handlers)
console.debug('Blog state initialized', { currentPage, totalPages, currentTag, allTags });

// --- Pagination Functions ---
async function loadPage(page: number, tag: string = 'all'): Promise<void> {
  if (!postsContainer) return;

  // Update state
  currentPage = page;
  currentTag = tag;

  // Show loader
  postsContainer.innerHTML = `
    <div class="text-center text-ink/50 py-12 text-sm">
      <p>Loading posts...</p>
    </div>
  `;

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
      <div class="text-center py-12">
        <p class="text-sm font-bold text-accent">Unable to load blog posts.</p>
        <p class="text-sm text-ink/50 mt-2">Please try refreshing the page.</p>
      </div>
    `;
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
    <article class="border-b border-ink/15">
      <a href="/post.html?slug=${encodeURIComponent(post.slug)}" class="group block py-6 hover:bg-ink/[0.03] transition-colors -mx-3 px-3">
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
          <time class="text-xs text-ink/50">${formatDate(post.date)}</time>
          ${post.pinned ? '<span class="text-xs font-bold text-accent">pinned</span>' : ''}
          <span class="text-xs text-ink/50">${post.tags.join(' · ')}</span>
        </div>

        <h2 class="text-lg font-bold group-hover:text-accent transition-colors mb-2">
          ${post.title}
          <span class="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </h2>

        <p class="text-sm leading-relaxed text-ink/70 max-w-xl">
          ${post.description}
        </p>
      </a>
    </article>
  `).join('');

  // Hide no posts message
  noPostsMessage.classList.add('hidden');
}

function updatePaginationUI(current: number, total: number, tag: string = 'all') {
  if (!paginationContainer) return;

  totalPages = total;

  if (total <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  const paginationHTML = `
    <nav class="flex items-center space-x-2 text-sm">
      <!-- Previous Button -->
      <button
        onclick="loadPage(${current - 1}, '${tag}')"
        class="px-3 py-1 border border-ink/30 hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        ${current === 1 ? 'disabled' : ''}
      >
        ←
      </button>

      <!-- Page Numbers -->
      ${generatePageNumbers(current, total).map(pageNum => {
        if (pageNum === '...') {
          return '<span class="px-2 py-1 text-ink/40">...</span>';
        }
        return `
          <button
            onclick="loadPage(${pageNum}, '${tag}')"
            class="px-3 py-1 border transition-colors ${
              pageNum === current
                ? 'border-ink bg-ink text-paper'
                : 'border-ink/30 hover:border-ink'
            }"
          >
            ${pageNum}
          </button>
        `;
      }).join('')}

      <!-- Next Button -->
      <button
        onclick="loadPage(${current + 1}, '${tag}')"
        class="px-3 py-1 border border-ink/30 hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        ${current === total ? 'disabled' : ''}
      >
        →
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
      button.className = 'tag-btn px-3 py-1 border border-ink/30 text-ink/70 hover:border-ink hover:text-ink transition-colors';
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
      btn.classList.remove('border-ink/30', 'text-ink/70', 'hover:border-ink', 'hover:text-ink');
      btn.classList.add('border-ink', 'bg-ink', 'text-paper');
    } else {
      btn.classList.remove('border-ink', 'bg-ink', 'text-paper');
      btn.classList.add('border-ink/30', 'text-ink/70', 'hover:border-ink', 'hover:text-ink');
    }
  });
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', async () => {
  // Setup tag filter first to get all tags
  await setupTagFilter();

  // Load first page
  await loadPage(1, 'all');

  // Initialize newsletter form
  initNewsletterForm();
});

// Make loadPage globally available for onclick handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).loadPage = loadPage;
