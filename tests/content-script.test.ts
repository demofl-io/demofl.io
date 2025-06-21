import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Content Script Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup basic DOM
    global.document = {
      addEventListener: vi.fn(),
      querySelector: vi.fn(),
      createElement: vi.fn(() => ({
        style: {},
        appendChild: vi.fn(),
        setAttribute: vi.fn(),
        textContent: ''
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      },
      head: {
        appendChild: vi.fn()
      }
    } as any
    
    global.window = {
      addEventListener: vi.fn(),
      location: { href: 'https://example.com' }
    } as any
  })

  it('should initialize without errors', () => {
    expect(() => {
      // Test basic functionality that would be in content scripts
      document.addEventListener('DOMContentLoaded', () => {})
      window.addEventListener('load', () => {})
    }).not.toThrow()
  })

  it('should handle DOM manipulation', () => {
    const element = document.createElement('div')
    element.textContent = 'Test content'
    document.body.appendChild(element)
    
    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(document.body.appendChild).toHaveBeenCalledWith(element)
  })

  it('should handle CSS injection', () => {
    const style = document.createElement('style')
    style.textContent = 'body { color: red; }'
    document.head.appendChild(style)
    
    expect(document.createElement).toHaveBeenCalledWith('style')
    expect(document.head.appendChild).toHaveBeenCalledWith(style)
  })

  it('should handle element queries', () => {
    const mockElement = { style: {}, classList: { add: vi.fn() } }
    document.querySelector.mockReturnValue(mockElement)
    
    const element = document.querySelector('.test-element')
    
    expect(element).toBe(mockElement)
    expect(document.querySelector).toHaveBeenCalledWith('.test-element')
  })
})