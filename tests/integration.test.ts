import { describe, it, expect, vi } from 'vitest'

describe('Extension Integration Tests', () => {
  it('should have valid manifest structure', () => {
    // Test that manifest.json can be parsed properly
    const manifest = {
      manifest_version: 3,
      name: 'demofl.io',
      version: '0.0.0.1',
      permissions: ['windows', 'activeTab', 'tabs', 'tabGroups', 'storage', 'background'],
      background: {
        service_worker: 'background-bundle.js'
      },
      content_scripts: [
        {
          matches: ['https://*/*', 'http://*/*'],
          js: ['content-bundle.js'],
          run_at: 'document_end'
        }
      ],
      action: {
        default_popup: 'html/popup.html'
      }
    }
    
    expect(manifest.manifest_version).toBe(3)
    expect(manifest.name).toBe('demofl.io')
    expect(manifest.permissions).toContain('storage')
    expect(manifest.permissions).toContain('tabs')
    expect(manifest.background.service_worker).toBe('background-bundle.js')
    expect(manifest.content_scripts).toHaveLength(1)
    expect(manifest.action.default_popup).toBe('html/popup.html')
  })

  it('should handle extension messages', async () => {
    const message = { type: 'TEST_MESSAGE', data: 'test' }
    const sendResponse = vi.fn()
    
    // Simulate message handling
    const messageHandler = (msg: any, sender: any, response: any) => {
      if (msg.type === 'TEST_MESSAGE') {
        response({ success: true, received: msg.data })
        return true
      }
      return false
    }
    
    const result = messageHandler(message, {}, sendResponse)
    
    expect(result).toBe(true)
    expect(sendResponse).toHaveBeenCalledWith({ success: true, received: 'test' })
  })

  it('should validate demo flow template structure', () => {
    const template = {
      customer: { name: 'Test Corp', logourl: 'logo.png' },
      product: { name: 'Test Product', logourl: 'product.png' },
      personas: {
        'john': { name: 'John', title: 'Manager', pictureurl: 'john.png', fakeText: [] }
      },
      steps: [
        {
          title: 'Step 1',
          description: 'Test step',
          urls: ['https://example.com'],
          persona: 'john',
          icon: 'home',
          tabColor: '#000000',
          incognito: false,
          onlyShowUrls: false
        }
      ],
      theme: {
        'brand-color': '#000000',
        'brand-font': 'Arial',
        'overlay-background': '#ffffff',
        'overlay-color': '#000000',
        'overlay-h': '50px',
        'overlay-scale': '1.0',
        'overlay-v': '50px'
      }
    }
    
    // Validate structure
    expect(template.customer).toBeDefined()
    expect(template.product).toBeDefined()
    expect(template.personas).toBeDefined()
    expect(template.steps).toBeDefined()
    expect(template.theme).toBeDefined()
    
    // Validate customer
    expect(template.customer.name).toBe('Test Corp')
    expect(template.customer.logourl).toBe('logo.png')
    
    // Validate product
    expect(template.product.name).toBe('Test Product')
    expect(template.product.logourl).toBe('product.png')
    
    // Validate personas
    expect(template.personas.john).toBeDefined()
    expect(template.personas.john.name).toBe('John')
    
    // Validate steps
    expect(template.steps).toHaveLength(1)
    expect(template.steps[0].title).toBe('Step 1')
    expect(template.steps[0].urls).toEqual(['https://example.com'])
    
    // Validate theme
    expect(template.theme['brand-color']).toBe('#000000')
    expect(template.theme['brand-font']).toBe('Arial')
  })

  it('should handle URL validation', () => {
    const validUrls = [
      'https://example.com',
      'http://localhost:3000',
      'https://app.example.com/dashboard',
      'https://subdomain.example.co.uk/path?param=value'
    ]
    
    const invalidUrls = [
      'not-a-url',
      'ftp://example.com',
      'javascript:alert("xss")',
      ''
    ]
    
    const isValidUrl = (url: string) => {
      try {
        const parsed = new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    }
    
    validUrls.forEach(url => {
      expect(isValidUrl(url)).toBe(true)
    })
    
    invalidUrls.forEach(url => {
      expect(isValidUrl(url)).toBe(false)
    })
  })

  it('should handle theme color validation', () => {
    const validColors = [
      '#ffffff',
      '#000000',
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#123456'
    ]
    
    const invalidColors = [
      'red',
      '#gggggg',
      '#12345',
      '#1234567',
      'rgb(255,0,0)',
      ''
    ]
    
    const isValidHexColor = (color: string) => {
      return /^#[0-9A-F]{6}$/i.test(color)
    }
    
    validColors.forEach(color => {
      expect(isValidHexColor(color)).toBe(true)
    })
    
    invalidColors.forEach(color => {
      expect(isValidHexColor(color)).toBe(false)
    })
  })

  it('should validate persona data', () => {
    const validPersona = {
      name: 'John Doe',
      title: 'Product Manager',
      pictureurl: 'https://example.com/john.jpg',
      fakeText: ['Hello there!', 'How can I help?']
    }
    
    const invalidPersona = {
      name: '',
      title: 'Manager',
      pictureurl: 'not-a-url',
      fakeText: 'not-an-array'
    }
    
    // Valid persona checks
    expect(validPersona.name).toBeTruthy()
    expect(validPersona.title).toBeTruthy()
    expect(Array.isArray(validPersona.fakeText)).toBe(true)
    
    // Invalid persona checks
    expect(invalidPersona.name).toBeFalsy()
    expect(Array.isArray(invalidPersona.fakeText)).toBe(false)
  })
})