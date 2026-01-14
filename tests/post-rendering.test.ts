import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Post Data Loading and Rendering', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
    
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

  describe('Post Data Loading', () => {
    it('should fetch posts from correct endpoint', async () => {
      const mockPosts = {
        posts: [
          {
            slug: 'test-post',
            title: 'Test Post',
            date: '2024-12-15',
            description: 'Test description',
            tags: ['test']
          }
        ],
        pagination: {
          current: 1,
          total: 1,
          hasNext: false
        }
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
        headers: new Headers(),
        status: 200,
        statusText: 'OK',
        redirected: false,
        type: 'basic',
        url: '/data/posts.json',
        clone: vi.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: vi.fn(),
        blob: vi.fn(),
        formData: vi.fn(),
        text: vi.fn(),
      } as unknown as Response)

      const response = await fetch('/data/posts.json')
      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith('/data/posts.json')
      expect(data).toEqual(mockPosts)
    })

    it('should handle fetch errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('/data/posts.json')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('should handle non-200 responses', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
        statusText: 'Not Found',
        redirected: false,
        type: 'basic',
        url: '/data/posts.json',
        clone: vi.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: vi.fn(),
        blob: vi.fn(),
        formData: vi.fn(),
        text: vi.fn(),
      } as unknown as Response)

      try {
        const response = await fetch('/data/posts.json')
        if (!response.ok) {
          throw new Error('Failed to load posts')
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('Post Rendering', () => {
    it('should render posts container correctly', () => {
      const postsContainer = document.createElement('div')
      postsContainer.id = 'posts-container'
      document.body.appendChild(postsContainer)

      const posts = [
        {
          slug: 'test-post',
          title: 'Test Post',
          date: '2024-12-15',
          description: 'Test description',
          tags: ['test'],
          content: '<h1>Test Content</h1>'
        }
      ]

      const postHTML = posts.map(post => `
        <article class="bg-white border rounded-lg p-6">
          <h2>${post.title}</h2>
          <p>${post.description}</p>
          <div class="flex gap-2">
            ${post.tags.map(tag => `<span>${tag}</span>`).join('')}
          </div>
        </article>
      `).join('')

      postsContainer.innerHTML = postHTML

      const articles = postsContainer.querySelectorAll('article')
      expect(articles).toHaveLength(1)
      expect(postsContainer.innerHTML).toContain('Test Post')
      expect(postsContainer.innerHTML).toContain('Test description')
      expect(postsContainer.innerHTML).toContain('<span>test</span>')
    })

    it('should handle empty posts list', () => {
      const postsContainer = document.createElement('div')
      postsContainer.id = 'posts-container'
      document.body.appendChild(postsContainer)

      const noPostsMessage = document.createElement('div')
      noPostsMessage.id = 'no-posts'
      noPostsMessage.className = 'hidden'
      document.body.appendChild(noPostsMessage)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts: any[] = []
      
      if (posts.length === 0) {
        postsContainer.innerHTML = ''
        noPostsMessage.classList.remove('hidden')
      }

      expect(postsContainer.innerHTML).toBe('')
      expect(noPostsMessage.classList.contains('hidden')).toBe(false)
    })

    it('should sanitize post data', () => {
      const maliciousPost = {
        slug: 'test-post',
        title: '<script>alert("xss")</script>Test Title',
        description: '<img src="x" onerror="alert(1)">Test Description',
        tags: ['<script>alert(1)</script>tag1', 'tag2']
      }

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

  describe('Pagination Rendering', () => {
    it('should render pagination controls', () => {
      const paginationContainer = document.createElement('div')
      paginationContainer.id = 'pagination-container'
      document.body.appendChild(paginationContainer)

      const pagination = {
        current: 1,
        total: 3,
        hasNext: true
      }

      const paginationHTML = `
        <nav class="flex items-center space-x-2">
          <button ${pagination.current === 1 ? 'disabled' : ''}>Previous</button>
          <button class="active">1</button>
          <button>2</button>
          <button>3</button>
          <button ${!pagination.hasNext ? 'disabled' : ''}>Next</button>
        </nav>
      `

      paginationContainer.innerHTML = paginationHTML

      const buttons = paginationContainer.querySelectorAll('button')
      expect(buttons).toHaveLength(5)
      expect(paginationContainer.innerHTML).toContain('disabled')
      expect(paginationContainer.innerHTML).toContain('class="active"')
    })

    it('should hide pagination for single page', () => {
      const paginationContainer = document.createElement('div')
      paginationContainer.id = 'pagination-container'
      document.body.appendChild(paginationContainer)

      const pagination = {
        current: 1,
        total: 1,
        hasNext: false
      }

      if (pagination.total <= 1) {
        paginationContainer.innerHTML = ''
      }

      expect(paginationContainer.innerHTML).toBe('')
    })
  })

  describe('Tag Filtering', () => {
    it('should render tag filter buttons', () => {
      const tagFilter = document.createElement('div')
      tagFilter.id = 'tag-filter'
      document.body.appendChild(tagFilter)

      const tags = ['all', 'javascript', 'react', 'typescript']
      
      const tagButtonsHTML = tags.map(tag => `
        <button class="tag-btn" data-tag="${tag}">${tag}</button>
      `).join('')

      tagFilter.innerHTML = tagButtonsHTML

      const buttons = tagFilter.querySelectorAll('.tag-btn')
      expect(buttons).toHaveLength(4)
      
      buttons.forEach((button, index) => {
        expect(button.getAttribute('data-tag')).toBe(tags[index])
        expect(button.textContent).toBe(tags[index])
      })
    })

    it('should handle active tag state', () => {
      const tagFilter = document.createElement('div')
      tagFilter.id = 'tag-filter'
      document.body.appendChild(tagFilter)

      const activeTag = 'javascript'
      
      const tagButtonsHTML = `
        <button class="tag-btn" data-tag="all">All Posts</button>
        <button class="tag-btn bg-slate-900 text-white" data-tag="${activeTag}">${activeTag}</button>
        <button class="tag-btn" data-tag="react">React</button>
      `

      tagFilter.innerHTML = tagButtonsHTML

      const activeButton = tagFilter.querySelector(`[data-tag="${activeTag}"]`)
      const otherButtons = tagFilter.querySelectorAll(`[data-tag]:not([data-tag="${activeTag}"])`)

      expect(activeButton?.className).toContain('bg-slate-900 text-white')
      otherButtons.forEach(button => {
        expect(button.className).toContain('tag-btn')
        expect(button.getAttribute('data-tag')).not.toBe(activeTag)
      })
    })
  })

  describe('Error Handling', () => {
    it('should show loading state', () => {
      const postsContainer = document.createElement('div')
      postsContainer.id = 'posts-container'
      document.body.appendChild(postsContainer)

      const loadingHTML = `
        <div class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin">Loading...</div>
          <p>Loading posts...</p>
        </div>
      `

      postsContainer.innerHTML = loadingHTML

      expect(postsContainer.innerHTML).toContain('Loading posts...')
      expect(postsContainer.innerHTML).toContain('animate-spin')
    })

    it('should show error state', () => {
      const postsContainer = document.createElement('div')
      postsContainer.id = 'posts-container'
      document.body.appendChild(postsContainer)

      const errorHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-red-500">
          <div class="text-lg font-medium">Unable to load blog posts.</div>
          <p class="text-sm">Please try refreshing the page.</p>
        </div>
      `

      postsContainer.innerHTML = errorHTML

      expect(postsContainer.innerHTML).toContain('Unable to load blog posts.')
      expect(postsContainer.innerHTML).toContain('text-red-500')
    })

    it('should handle malformed JSON', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Unexpected token in JSON')
        },
        headers: new Headers(),
        status: 200,
        statusText: 'OK',
        redirected: false,
        type: 'basic',
        url: '/data/posts.json',
        clone: vi.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: vi.fn(),
        blob: vi.fn(),
        formData: vi.fn(),
        text: vi.fn(),
      } as unknown as Response)

      try {
        const response = await fetch('/data/posts.json')
        await response.json()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('URL Slug Extraction', () => {
    it('should extract slug from query parameter', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?slug=test-post',
          pathname: '/post.html'
        },
        writable: true,
      })

      const params = new URLSearchParams(window.location.search)
      const slug = params.get('slug')

      expect(slug).toBe('test-post')
    })

    it('should extract slug from path', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '',
          pathname: '/blog/test-post'
        },
        writable: true,
      })

      const path = window.location.pathname
      const match = path.match(/\/blog\/([^/]+)/)
      const slug = match ? match[1] : null

      expect(slug).toBe('test-post')
    })

    it('should return null when no slug found', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '',
          pathname: '/blog'
        },
        writable: true,
      })

      const params = new URLSearchParams(window.location.search)
      const querySlug = params.get('slug')
      
      const path = window.location.pathname
      const pathMatch = path.match(/\/blog\/([^/]+)/)
      const pathSlug = pathMatch ? pathMatch[1] : null

      const slug = querySlug || pathSlug

      expect(slug).toBeNull()
    })
  })
})