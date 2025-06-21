import { describe, it, expect } from 'vitest'
import { 
  DemoFlowTemplate, 
  ExtensionMessage, 
  Customer,
  Persona,
  Product,
  Step,
  Theme,
  UserTemplate,
  StorageResult,
  AuthUser
} from '../js/types'

describe('Type Definitions', () => {
  describe('Customer', () => {
    it('should have correct structure', () => {
      const customer: Customer = {
        name: 'Acme Corp',
        logourl: 'https://example.com/logo.png'
      }
      
      expect(customer.name).toBe('Acme Corp')
      expect(customer.logourl).toBe('https://example.com/logo.png')
    })
  })

  describe('Persona', () => {
    it('should have correct structure', () => {
      const persona: Persona = {
        name: 'John Doe',
        pictureurl: 'https://example.com/john.jpg',
        title: 'Product Manager',
        fakeText: ['Hello there!', 'How are you?']
      }
      
      expect(persona.name).toBe('John Doe')
      expect(persona.pictureurl).toBe('https://example.com/john.jpg')
      expect(persona.title).toBe('Product Manager')
      expect(persona.fakeText).toEqual(['Hello there!', 'How are you?'])
    })
  })

  describe('Product', () => {
    it('should have correct structure', () => {
      const product: Product = {
        name: 'Amazing Product',
        logourl: 'https://example.com/product.png'
      }
      
      expect(product.name).toBe('Amazing Product')
      expect(product.logourl).toBe('https://example.com/product.png')
    })
  })

  describe('Step', () => {
    it('should have correct structure with all properties', () => {
      const step: Step = {
        title: 'Login Step',
        description: 'User logs into the system',
        urls: ['https://app.example.com/login'],
        persona: 'john',
        icon: 'login',
        tabColor: '#007bff',
        incognito: false,
        onlyShowUrls: true,
        video: 'login-demo.mp4'
      }
      
      expect(step.title).toBe('Login Step')
      expect(step.description).toBe('User logs into the system')
      expect(step.urls).toEqual(['https://app.example.com/login'])
      expect(step.persona).toBe('john')
      expect(step.icon).toBe('login')
      expect(step.tabColor).toBe('#007bff')
      expect(step.incognito).toBe(false)
      expect(step.onlyShowUrls).toBe(true)
      expect(step.video).toBe('login-demo.mp4')
    })

    it('should allow optional video property', () => {
      const step: Step = {
        title: 'Simple Step',
        description: 'A step without video',
        urls: ['https://example.com'],
        persona: 'jane',
        icon: 'home',
        tabColor: '#28a745',
        incognito: false,
        onlyShowUrls: false
      }
      
      expect(step.video).toBeUndefined()
    })
  })

  describe('Theme', () => {
    it('should have correct structure', () => {
      const theme: Theme = {
        'brand-color': '#007bff',
        'brand-font': 'Roboto',
        'overlay-background': '#ffffff',
        'overlay-color': '#000000',
        'overlay-h': '100px',
        'overlay-scale': '1.2',
        'overlay-v': '50px'
      }
      
      expect(theme['brand-color']).toBe('#007bff')
      expect(theme['brand-font']).toBe('Roboto')
      expect(theme['overlay-background']).toBe('#ffffff')
      expect(theme['overlay-color']).toBe('#000000')
      expect(theme['overlay-h']).toBe('100px')
      expect(theme['overlay-scale']).toBe('1.2')
      expect(theme['overlay-v']).toBe('50px')
    })
  })

  describe('DemoFlowTemplate', () => {
    it('should have correct structure', () => {
      const template: DemoFlowTemplate = {
        customer: {
          name: 'Test Corp',
          logourl: 'test-logo.png'
        },
        product: {
          name: 'Test Product',
          logourl: 'product-logo.png'
        },
        personas: {
          'john': {
            name: 'John Smith',
            pictureurl: 'john.jpg',
            title: 'Manager',
            fakeText: ['Hello']
          }
        },
        steps: [
          {
            title: 'Step 1',
            description: 'First step',
            urls: ['https://example.com'],
            persona: 'john',
            icon: 'home',
            tabColor: '#000',
            incognito: false,
            onlyShowUrls: false
          }
        ],
        theme: {
          'brand-color': '#000',
          'brand-font': 'Arial',
          'overlay-background': '#fff',
          'overlay-color': '#000',
          'overlay-h': '50px',
          'overlay-scale': '1.0',
          'overlay-v': '50px'
        }
      }
      
      expect(template.customer.name).toBe('Test Corp')
      expect(template.product.name).toBe('Test Product')
      expect(template.personas['john'].name).toBe('John Smith')
      expect(template.steps.length).toBe(1)
      expect(template.theme['brand-color']).toBe('#000')
    })
  })

  describe('ExtensionMessage', () => {
    it('should have correct structure with all optional properties', () => {
      const message: ExtensionMessage = {
        type: 'EXTENSION_RUNDEMO',
        payload: { data: 'test' },
        action: 'getTabId',
        persona: {
          name: 'Test User',
          pictureurl: 'test.jpg',
          title: 'Tester',
          fakeText: ['Test message']
        },
        tabId: 123,
        code: 'auth-code-123',
        error: 'Something went wrong'
      }
      
      expect(message.type).toBe('EXTENSION_RUNDEMO')
      expect(message.payload).toEqual({ data: 'test' })
      expect(message.action).toBe('getTabId')
      expect(message.persona?.name).toBe('Test User')
      expect(message.tabId).toBe(123)
      expect(message.code).toBe('auth-code-123')
      expect(message.error).toBe('Something went wrong')
    })

    it('should allow minimal structure with only type', () => {
      const message: ExtensionMessage = {
        type: 'AUTH_SUCCESS'
      }
      
      expect(message.type).toBe('AUTH_SUCCESS')
      expect(message.payload).toBeUndefined()
      expect(message.action).toBeUndefined()
    })
  })

  describe('UserTemplate', () => {
    it('should have correct structure', () => {
      const userTemplate: UserTemplate = {
        name: 'My Custom Template',
        data: {
          customer: { name: 'Customer', logourl: 'logo.png' },
          product: { name: 'Product', logourl: 'product.png' },
          personas: {},
          steps: [],
          theme: {
            'brand-color': '#000',
            'brand-font': 'Arial',
            'overlay-background': '#fff',
            'overlay-color': '#000',
            'overlay-h': '50px',
            'overlay-scale': '1.0',
            'overlay-v': '50px'
          }
        },
        type: 'custom'
      }
      
      expect(userTemplate.name).toBe('My Custom Template')
      expect(userTemplate.data.customer.name).toBe('Customer')
      expect(userTemplate.type).toBe('custom')
    })

    it('should allow optional type property', () => {
      const userTemplate: UserTemplate = {
        name: 'Template Without Type',
        data: {
          customer: { name: 'Customer', logourl: 'logo.png' },
          product: { name: 'Product', logourl: 'product.png' },
          personas: {},
          steps: [],
          theme: {
            'brand-color': '#000',
            'brand-font': 'Arial',
            'overlay-background': '#fff',
            'overlay-color': '#000',
            'overlay-h': '50px',
            'overlay-scale': '1.0',
            'overlay-v': '50px'
          }
        }
      }
      
      expect(userTemplate.type).toBeUndefined()
    })
  })

  describe('StorageResult', () => {
    it('should allow any key-value pairs', () => {
      const storage: StorageResult = {
        demo: { some: 'data' },
        userTemplates: [],
        authToken: 'token123',
        settings: { theme: 'dark' }
      }
      
      expect(storage.demo).toEqual({ some: 'data' })
      expect(storage.userTemplates).toEqual([])
      expect(storage.authToken).toBe('token123')
      expect(storage.settings).toEqual({ theme: 'dark' })
    })
  })

  describe('AuthUser', () => {
    it('should have correct structure with all properties', () => {
      const user: AuthUser = {
        email: 'user@example.com',
        paid: true,
        trialStartedAt: new Date('2023-01-01')
      }
      
      expect(user.email).toBe('user@example.com')
      expect(user.paid).toBe(true)
      expect(user.trialStartedAt).toBeInstanceOf(Date)
    })

    it('should allow null email and optional trialStartedAt', () => {
      const user: AuthUser = {
        email: null,
        paid: false
      }
      
      expect(user.email).toBe(null)
      expect(user.paid).toBe(false)
      expect(user.trialStartedAt).toBeUndefined()
    })
  })
})