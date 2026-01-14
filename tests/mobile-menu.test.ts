import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setupMobileMenu } from '../src/lib/ui'

describe('Mobile Menu Logic', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = ''
    
    // Create mobile menu elements
    const menuBtn = document.createElement('button')
    menuBtn.id = 'menu-btn'
    
    const mobileMenu = document.createElement('div')
    mobileMenu.id = 'mobile-menu'
    mobileMenu.classList.add('hidden')
    
    const link1 = document.createElement('a')
    link1.href = '#home'
    link1.className = 'mobile-link'
    link1.textContent = 'Home'
    
    const link2 = document.createElement('a')
    link2.href = '#about'
    link2.className = 'mobile-link'
    link2.textContent = 'About'
    
    document.body.appendChild(menuBtn)
    document.body.appendChild(mobileMenu)
    document.body.appendChild(link1)
    document.body.appendChild(link2)
    
    // Mock console.warn
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should set up mobile menu when elements exist', () => {
    const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement
    const mobileMenu = document.getElementById('mobile-menu')
    
    setupMobileMenu()
    
    // Should have click handler
    expect(menuBtn.onclick).toBeDefined()
    
    // Should start hidden
    expect(mobileMenu.classList.contains('hidden')).toBe(true)
  })

  it('should toggle menu visibility when button clicked', () => {
    const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement
    const mobileMenu = document.getElementById('mobile-menu')
    
    setupMobileMenu()
    
    // Click to open
    menuBtn.click()
    expect(mobileMenu.classList.contains('hidden')).toBe(false)
    expect(mobileMenu.classList.contains('flex')).toBe(true)
    
    // Click to close
    menuBtn.click()
    expect(mobileMenu.classList.contains('hidden')).toBe(true)
    expect(mobileMenu.classList.contains('flex')).toBe(false)
  })

  it('should close menu when mobile link is clicked', () => {
    const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement
    const mobileMenu = document.getElementById('mobile-menu')
    const mobileLink = document.querySelector('.mobile-link') as HTMLAnchorElement
    
    setupMobileMenu()
    
    // Open menu first
    menuBtn.click()
    expect(mobileMenu.classList.contains('hidden')).toBe(false)
    
    // Click link to close
    mobileLink.click()
    expect(mobileMenu.classList.contains('hidden')).toBe(true)
  })

  it('should close menu when clicking outside', () => {
    const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement
    const mobileMenu = document.getElementById('mobile-menu')
    
    // Create an outside element
    const outsideElement = document.createElement('div')
    outsideElement.id = 'outside'
    document.body.appendChild(outsideElement)
    
    setupMobileMenu()
    
    // Open menu first
    menuBtn.click()
    expect(mobileMenu.classList.contains('hidden')).toBe(false)
    
    // Click outside to close
    outsideElement.click()
    expect(mobileMenu.classList.contains('hidden')).toBe(true)
  })

  it('should not close menu when clicking inside menu', () => {
    const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement
    const mobileMenu = document.getElementById('mobile-menu')
    
    setupMobileMenu()
    
    // Open menu first
    menuBtn.click()
    expect(mobileMenu.classList.contains('hidden')).toBe(false)
    
    // Click inside menu (should stay open)
    mobileMenu.click()
    expect(mobileMenu.classList.contains('hidden')).toBe(false)
  })

  it('should warn when required elements are missing', () => {
    // Remove menu button
    const menuBtn = document.getElementById('menu-btn')
    if (menuBtn) menuBtn.remove()
    
    setupMobileMenu()
    
    expect(console.warn).toHaveBeenCalledWith('Mobile menu elements not found')
  })

  it('should handle missing mobile menu gracefully', () => {
    // Remove mobile menu
    const mobileMenu = document.getElementById('mobile-menu')
    if (mobileMenu) mobileMenu.remove()
    
    setupMobileMenu()
    
    expect(console.warn).toHaveBeenCalledWith('Mobile menu elements not found')
  })

  it('should work with multiple mobile links', () => {
    const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement
    const mobileMenu = document.getElementById('mobile-menu')
    const mobileLinks = document.querySelectorAll('.mobile-link')
    
    setupMobileMenu()
    
    // Open menu
    menuBtn.click()
    expect(mobileMenu.classList.contains('hidden')).toBe(false)
    
    // Click each link - should close menu each time
    mobileLinks.forEach((link) => {
      menuBtn.click() // Reopen menu
      link.click()
      expect(mobileMenu.classList.contains('hidden')).toBe(true)
    })
  })
})