import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Setup DOM environment
beforeAll(() => {
  // Mock window object if needed
  Object.defineProperty(window, 'location', {
    value: {
      search: '',
      pathname: '/',
      hash: '',
    },
    writable: true,
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    callback,
  }))
})

// Cleanup after each test
afterEach(() => {
  // DOM cleanup handled by jsdom environment reset
})

// Cleanup after all tests
afterAll(() => {
  // Any global cleanup
})