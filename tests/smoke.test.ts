// Basic smoke test to verify testing infrastructure works
import { describe, it, expect } from 'vitest'

describe('Testing Infrastructure', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have DOM environment', () => {
    expect(document.body).toBeDefined()
  })

  it('should have jest-dom matchers', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    expect(div).toBeInTheDocument()
  })
})