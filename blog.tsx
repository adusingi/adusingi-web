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

// Import Shared Logic
import { setupMobileMenu } from './src/lib/ui';
import { formatDate } from './src/lib/utils';
import { createIcons, Menu, Twitter, Linkedin, Mail, Loader2, AlertCircle } from 'lucide';

// Import newsletter form
import { initNewsletterForm } from './src/components/newsletter-form.js';

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
}

document.addEventListener('DOMContentLoaded', async () => {
  // --- Mobile Menu Toggle ---
  setupMobileMenu();

  // --- Reveal on Scroll Animation ---
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
  let allPosts: Post[] = [];
  let visibleCount = 6;
  const LOAD_CHUNK = 6;

  // Create Load More Button
  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'hidden px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-full hover:bg-slate-50 transition-colors mx-auto mt-12 block';
  loadMoreBtn.textContent = 'Load More Posts';

  if (postsContainer) {
    postsContainer.parentNode?.insertBefore(loadMoreBtn, postsContainer.nextSibling);
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += LOAD_CHUNK;
      // Re-apply filter with new count
      const activeTagBtn = document.querySelector('.tag-btn.bg-slate-900');
      const tag = activeTagBtn?.getAttribute('data-tag') || 'all';
      filterByTag(tag);
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

    const visiblePosts = filteredPosts.slice(0, visibleCount);

    // Show/Hide Load More
    if (visibleCount < filteredPosts.length) {
      loadMoreBtn.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.add('hidden');
    }

    postsContainer.innerHTML = visiblePosts.map(post => `
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
    // Note: We need to re-query only the new elements or just observe all unobserved.
    // Simpler: query all .reveal and observe (IntersectionObserver handles duplicates gracefully if same target is observed twice? 
    // Actually, observe(target) adds it unless already observed? MDN says "If the target is already being observed ... no change occurs.")
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- Tag Filtering ---
  function setupTagFilter() {
    const allTags = new Set<string>();
    allPosts.forEach(post => {
      post.tags.forEach(tag => allTags.add(tag));
    });

    const tagFilter = document.getElementById('tag-filter');
    if (tagFilter) {
      tagFilter.innerHTML = ''; // Clear existing

      // "All" button
      const allBtn = document.createElement('button');
      allBtn.className = 'tag-btn px-4 py-2 text-sm font-medium rounded-full transition-colors bg-slate-900 text-white';
      allBtn.dataset.tag = 'all';
      allBtn.textContent = 'All';
      tagFilter.appendChild(allBtn);

      const sortedTags = Array.from(allTags).sort();
      sortedTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'tag-btn px-4 py-2 text-sm font-medium rounded-full transition-colors bg-slate-50 text-slate-700 hover:bg-slate-100';
        button.dataset.tag = tag;
        button.textContent = tag;
        tagFilter.appendChild(button);
      });

      // Add click handlers
      const tagButtons = document.querySelectorAll('.tag-btn');
      tagButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const tag = btn.getAttribute('data-tag');
          if (tag) filterByTag(tag);
        });
      });
    }
  }

  function filterByTag(tag: string) {
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

    // Reset pagination on filter change
    visibleCount = LOAD_CHUNK;

    const filteredPosts = tag === 'all'
      ? allPosts
      : allPosts.filter(post => post.tags.includes(tag));

    renderPosts(filteredPosts);
  }

  // --- Data Loading ---
  async function loadData() {
    if (!postsContainer) return;

    // Show Loader
    postsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-4"></i>
        <p>Loading posts...</p>
      </div>
    `;
    createIcons({ icons: { Loader2 } }); // Refresh icons for loader

    try {
      // Fetch lightweight summaries
      const response = await fetch('/data/posts-all.json');

      if (!response.ok) {
        throw new Error(`Failed to load posts: ${response.statusText}`);
      }

      allPosts = await response.json();

      setupTagFilter();
      renderPosts(allPosts);

      // Initialize icons for the newly rendered posts
      createIcons({ icons: { Loader2, AlertCircle } });

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

  // Start
  await loadData();
  initNewsletterForm();

  // Reveal elements logic for static parts
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => revealObserver.observe(el));
});
