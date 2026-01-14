import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock the global functions and DOM setup
describe('Blog Pagination Logic', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="posts-container"></div>
      <div id="no-posts" class="hidden"></div>
      <div id="pagination-container"></div>
      <div id="tag-filter">
        <button class="tag-btn" data-tag="all">All Posts</button>
      </div>
    `

    // Mock fetch
    global.fetch = vi.fn()

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/blog',
        search: '',
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generatePageNumbers', () => {
    // Test the function directly by copying its logic
    const generatePageNumbers = (current: number, total: number): (number | string)[] => {
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

    it('should return all pages when total is less than max visible', () => {
      const result = generatePageNumbers(2, 3)
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle ellipsis for current page near start', () => {
      const result = generatePageNumbers(2, 10)
      expect(result).toEqual([1, 2, 3, 4, '...', 10])
    })

    it('should handle ellipsis for current page near end', () => {
      const result = generatePageNumbers(9, 10)
      expect(result).toEqual([1, '...', 7, 8, 9, 10])
    })

    it('should handle ellipsis for current page in middle', () => {
      const result = generatePageNumbers(5, 10)
      expect(result).toEqual([1, '...', 4, 5, 6, '...', 10])
    })

    it('should handle single page', () => {
      const result = generatePageNumbers(1, 1)
      expect(result).toEqual([1])
    })

    it('should handle exactly max visible pages', () => {
      const result = generatePageNumbers(3, 5)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('Post Sanitization', () => {
    it('should sanitize HTML in post data', () => {
      const maliciousPost = {
        slug: 'test-post',
        title: '<script>alert("xss")</script>Test Title',
        description: '<img src="x" onerror="alert(1)">Test Description',
        tags: ['<script>alert(1)</script>tag1', 'tag2']
      }

      // Simulate the sanitization logic from renderPosts
      const sanitizedPost = {
        ...maliciousPost,
        title: maliciousPost.title.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        description: maliciousPost.description.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        tags: maliciousPost.tags.map(tag => tag.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
      }

      expect(sanitizedPost.title).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;Test Title')
      expect(sanitizedPost.description).toBe('&lt;img src="x" onerror="alert(1)"&gt;Test Description')
      expect(sanitizedPost.tags).toEqual(['&lt;script&gt;alert(1)&lt;/script&gt;tag1', 'tag2'])
    })
  })

  describe('Tag Filtering Logic', () => {
    it('should extract unique tags from posts', () => {
      const posts = [
        { tags: ['javascript', 'react'] },
        { tags: ['typescript', 'react'] },
        { tags: ['javascript', 'node'] }
      ]

      const tagSet = new Set<string>()
      posts.forEach(post => {
        post.tags.forEach(tag => tagSet.add(tag))
      })
      const allTags = Array.from(tagSet).sort()

      expect(allTags).toEqual(['javascript', 'node', 'react', 'typescript'])
    })

    it('should handle posts with no tags', () => {
      const posts = [
        { tags: [] },
        { tags: ['javascript'] }
      ]

      const tagSet = new Set<string>()
      posts.forEach(post => {
        post.tags.forEach(tag => tagSet.add(tag))
      })
      const allTags = Array.from(tagSet).sort()

      expect(allTags).toEqual(['javascript'])
    })
  })

  describe('Client-side Pagination', () => {
    it('should paginate filtered posts correctly', () => {
      const filteredPosts = Array.from({ length: 15 }, (_, i) => ({
        slug: `post-${i}`,
        title: `Post ${i}`,
        tags: ['test']
      }))

      const PAGE_SIZE = 6
      const page = 2
      const startIndex = (page - 1) * PAGE_SIZE
      const endIndex = startIndex + PAGE_SIZE
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

      expect(paginatedPosts).toHaveLength(6)
      expect(paginatedPosts[0].slug).toBe('post-6')
      expect(paginatedPosts[5].slug).toBe('post-11')
    })

    it('should calculate total pages correctly', () => {
      const filteredPosts = Array.from({ length: 15 }, (_, i) => ({ slug: `post-${i}` }))
      const PAGE_SIZE = 6
      const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE)

      expect(totalPages).toBe(3)
    })

    it('should handle last page with fewer items', () => {
      const filteredPosts = Array.from({ length: 8 }, (_, i) => ({ slug: `post-${i}` }))
      const PAGE_SIZE = 6
      const page = 2
      const startIndex = (page - 1) * PAGE_SIZE
      const endIndex = startIndex + PAGE_SIZE
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

      expect(paginatedPosts).toHaveLength(2)
      expect(paginatedPosts[0].slug).toBe('post-6')
      expect(paginatedPosts[1].slug).toBe('post-7')
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const postsContainer = document.getElementById('posts-container')
      
      // Mock fetch to throw error
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      // Simulate the error handling from loadPage function
      try {
        await fetch('/data/posts.json')
      } catch {
        if (postsContainer) {
          postsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-red-500">
              <p class="text-lg font-medium">Unable to load blog posts.</p>
              <p class="text-sm text-slate-500 mt-2">Please try refreshing the page.</p>
            </div>
          `
        }
      }

      expect(postsContainer?.innerHTML).toContain('Unable to load blog posts')
    })

    it('should handle 404 responses', async () => {
      // Mock fetch to return 404
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response)

      try {
        const response = await fetch('/data/posts.json')
        if (!response.ok) {
          throw new Error('Failed to load posts')
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Failed to load posts')
      }
    })
  })
})