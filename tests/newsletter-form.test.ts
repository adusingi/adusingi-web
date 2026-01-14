import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initNewsletterForm } from '../src/components/newsletter-form'

describe('Newsletter Form Validation', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = `
      <form id="newsletter-form">
        <input id="newsletter-email" type="email" placeholder="Enter your email" />
        <button id="newsletter-submit" type="submit">Subscribe</button>
        <div id="newsletter-message" class="hidden"></div>
      </form>
    `

    // Mock fetch
    global.fetch = vi.fn()
    
    // Mock console.log
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize newsletter form when elements exist', () => {
    const form = document.getElementById('newsletter-form') as HTMLFormElement
    const input = document.getElementById('newsletter-email') as HTMLInputElement
    const button = document.getElementById('newsletter-submit') as HTMLButtonElement
    const message = document.getElementById('newsletter-message') as HTMLDivElement

    initNewsletterForm()

    // Form should have submit event listener
    expect(form.onsubmit).toBeDefined()
    
    // Elements should exist
    expect(form).toBeTruthy()
    expect(input).toBeTruthy()
    expect(button).toBeTruthy()
    expect(message).toBeTruthy()
  })

  it('should warn when form elements are missing', () => {
    // Remove form element
    const form = document.getElementById('newsletter-form')
    if (form) form.remove()

    initNewsletterForm()

    expect(console.log).toHaveBeenCalledWith('Newsletter form elements not found')
  })

  it('should validate empty email', async () => {
    const form = document.getElementById('newsletter-form') as HTMLFormElement
    const input = document.getElementById('newsletter-email') as HTMLInputElement
    const message = document.getElementById('newsletter-message') as HTMLDivElement

    initNewsletterForm()

    // Submit with empty email
    input.value = ''
    form.dispatchEvent(new Event('submit'))

    // Should show error message
    expect(message.textContent).toBe('Please enter your email address')
    expect(message.className).toContain('text-red-600')
    expect(message.classList.contains('hidden')).toBe(false)
  })

  it('should validate invalid email format', async () => {
    const form = document.getElementById('newsletter-form') as HTMLFormElement
    const input = document.getElementById('newsletter-email') as HTMLInputElement
    const message = document.getElementById('newsletter-message') as HTMLDivElement

    initNewsletterForm()

    // Submit with invalid email
    input.value = 'invalid-email'
    form.dispatchEvent(new Event('submit'))

    // Should show error message
    expect(message.textContent).toBe('Please enter a valid email address')
    expect(message.className).toContain('text-red-600')
    expect(message.classList.contains('hidden')).toBe(false)
  })

  it('should validate valid email format', async () => {
    const form = document.getElementById('newsletter-form') as HTMLFormElement
    const input = document.getElementById('newsletter-email') as HTMLInputElement
    const message = document.getElementById('newsletter-message') as HTMLDivElement

    initNewsletterForm()

    // Mock successful API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success!' })
    } as Response)

    // Submit with valid email
    input.value = 'test@example.com'
    form.dispatchEvent(new Event('submit'))

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should have called fetch
    expect(fetch).toHaveBeenCalledWith('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })
  })

  it('should handle successful subscription', async () => {
    const form = document.getElementById('newsletter-form') as HTMLFormElement
    const input = document.getElementById('newsletter-email') as HTMLInputElement
    const button = document.getElementById('newsletter-submit') as HTMLButtonElement
    const message = document.getElementById('newsletter-message') as HTMLDivElement

    initNewsletterForm()

    // Mock successful API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '🎉 Thanks for subscribing! Check your email.' })
    } as Response)

    // Submit with valid email
    input.value = 'test@example.com'
    form.dispatchEvent(new Event('submit'))

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should show success message
    expect(message.textContent).toBe('🎉 Thanks for subscribing! Check your email.')
    expect(message.className).toContain('text-green-600')
    expect(message.classList.contains('hidden')).toBe(false)

    // Should clear input
    expect(input.value).toBe('')

    // Should re-enable button
    expect(button.disabled).toBe(false)
    expect(button.textContent).toBe('Subscribe')
  })

  it('should handle API error response', async () => {
    const form = document.getElementById('newsletter-form') as HTMLFormElement
    const input = document.getElementById('newsletter-email') as HTMLInputElement
    const button = document.getElementById('newsletter-submit') as HTMLButtonElement
    const message = document.getElementById('newsletter-message') as HTMLDivElement

    initNewsletterForm()

    // Mock error API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Email already subscribed' })
    } as Response)

    // Submit with valid email
    input.value = 'test@example.com'
    form.dispatchEvent(new Event('submit'))

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should show error message
    expect(message.textContent).toBe('Email already subscribed')
    expect(message.className).toContain('text-red-600')
    expect(message.classList.contains('hidden')).toBe(false)

    // Should re-enable button
    expect(button.disabled).toBe(false)
    expect(button.textContent).toBe('Subscribe')
  })

  it('should handle network error', async () => {
    const form = document.getElementById('newsletter-form') as HTMLFormElement
    const input = document.getElementById('newsletter-email') as HTMLInputElement
    const button = document.getElementById('newsletter-submit') as HTMLButtonElement
    const message = document.getElementById('newsletter-message') as HTMLDivElement

    initNewsletterForm()

    // Mock network error
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    // Submit with valid email
    input.value = 'test@example.com'
    form.dispatchEvent(new Event('submit'))

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should show network error message
    expect(message.textContent).toBe('Network error. Please try again later.')
    expect(message.className).toContain('text-red-600')
    expect(message.classList.contains('hidden')).toBe(false)

    // Should re-enable button
    expect(button.disabled).toBe(false)
    expect(button.textContent).toBe('Subscribe')
  })

  it('should handle 404 (local dev) response', async () => {
    const form = document.getElementById('newsletter-form') as HTMLFormElement
    const input = document.getElementById('newsletter-email') as HTMLInputElement
    const message = document.getElementById('newsletter-message') as HTMLDivElement

    initNewsletterForm()

    // Mock 404 response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404
    } as Response)

    // Submit with valid email
    input.value = 'test@example.com'
    form.dispatchEvent(new Event('submit'))

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should show 404 message
    expect(message.textContent).toBe('API not available in local dev. Deploy to Vercel or use "vercel dev".')
    expect(message.className).toContain('text-red-600')
    expect(message.classList.contains('hidden')).toBe(false)
  })

  it('should disable form during submission', async () => {
    const form = document.getElementById('newsletter-form') as HTMLFormElement
    const input = document.getElementById('newsletter-email') as HTMLInputElement
    const button = document.getElementById('newsletter-submit') as HTMLButtonElement

    initNewsletterForm()

    // Mock delayed response
    vi.mocked(fetch).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ message: 'Success!' })
        } as Response), 100)
      )
    )

    // Submit with valid email
    input.value = 'test@example.com'
    form.dispatchEvent(new Event('submit'))

    // Should disable form during submission
    expect(button.disabled).toBe(true)
    expect(button.textContent).toBe('Subscribing...')
    expect(input.disabled).toBe(true)

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 150))

    // Should re-enable after completion
    expect(button.disabled).toBe(false)
    expect(input.disabled).toBe(false)
  })
})