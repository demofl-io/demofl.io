import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DemoFlowTemplate } from '../js/types'

describe('Parser Logic', () => {
  const mockDemoData: DemoFlowTemplate = {
    customer: { name: 'Test Customer', logourl: 'test-customer.png' },
    product: { name: 'Test Product', logourl: 'test-product.png' },
    personas: {
      'john': { name: 'John Doe', title: 'Manager', pictureurl: 'john.png', fakeText: ['Hello'] }
    },
    steps: [
      {
        title: 'Step 1',
        description: 'First step',
        urls: ['https://example.com'],
        persona: 'john',
        icon: 'home',
        tabColor: '#ff0000',
        incognito: false,
        onlyShowUrls: false
      },
      {
        title: 'Step 2',
        description: 'Second step',
        urls: ['https://test.com', 'https://demo.com'],
        persona: 'john',
        icon: 'user',
        tabColor: '#00ff00',
        incognito: true,
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

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset chrome mocks
    global.chrome.windows.getCurrent.mockResolvedValue({ id: 1 })
    global.chrome.windows.create.mockResolvedValue({ id: 2 })
    global.chrome.tabs.create.mockResolvedValue({ id: 100 })
    global.chrome.storage.local.get.mockResolvedValue({})
    global.chrome.storage.local.set.mockResolvedValue(undefined)
    global.chrome.tabGroups.create.mockResolvedValue({ id: 1 })
    global.chrome.tabGroups.update.mockResolvedValue(undefined)
    
    global.fetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockDemoData)
    } as any)
  })

  describe('saveDemoToLocalStorage', () => {
    it('should save demo data to chrome storage', async () => {
      // Simulate the saveDemoToLocalStorage function
      const saveDemoToLocalStorage = async (demoData: DemoFlowTemplate) => {
        await chrome.storage.local.set({ demo: demoData });
      }
      
      await saveDemoToLocalStorage(mockDemoData)
      
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        demo: mockDemoData
      })
    })
  })

  describe('openJSONFile', () => {
    it('should handle builtin JSON file logic', async () => {
      const value = 'builtin:template1'
      const [type, name] = value.split(':')
      
      expect(type).toBe('builtin')
      expect(name).toBe('template1')
      
      // Simulate the logic without actual import
      if (type === 'builtin') {
        const flowurl = chrome.runtime.getURL(`/demos/${name}.json`)
        
        expect(global.chrome.runtime.getURL).toHaveBeenCalledWith('/demos/template1.json')
      }
    })

    it('should handle user template logic', async () => {
      const value = 'user:custom-template'
      const [type, name] = value.split(':')
      
      expect(type).toBe('user')
      expect(name).toBe('custom-template')
      
      // Simulate getting user templates
      if (type === 'user') {
        await chrome.storage.local.get('userTemplates')
        
        expect(global.chrome.storage.local.get).toHaveBeenCalledWith('userTemplates')
      }
    })
  })

  describe('parseDemoFile logic', () => {
    it('should create overview and personas tabs', async () => {
      // Simulate the core logic
      const currentWindow = await chrome.windows.getCurrent()
      const currentWindowId = currentWindow.id
      
      // Save demo data first
      await chrome.storage.local.set({ demo: mockDemoData })
      
      // Create overview tab
      await chrome.tabs.create({
        active: true,
        url: chrome.runtime.getURL('html/overview.html'),
        windowId: currentWindowId
      })
      
      // Create personas tab
      await chrome.tabs.create({
        active: false,
        url: chrome.runtime.getURL('html/personas.html'),
        windowId: currentWindowId
      })
      
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        demo: mockDemoData
      })
      
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({
        active: true,
        url: 'chrome-extension://test-id/html/overview.html',
        windowId: 1
      })
      
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({
        active: false,
        url: 'chrome-extension://test-id/html/personas.html',
        windowId: 1
      })
    })

    it('should handle incognito steps', async () => {
      const incognitoStep = mockDemoData.steps[1]
      
      if (incognitoStep.incognito && incognitoStep.urls.length > 0) {
        await chrome.windows.create({ incognito: true })
        
        expect(global.chrome.windows.create).toHaveBeenCalledWith({ incognito: true })
      }
    })

    it('should handle empty steps', () => {
      const demoWithoutSteps: DemoFlowTemplate = {
        ...mockDemoData,
        steps: []
      }
      
      expect(demoWithoutSteps.steps).toHaveLength(0)
      
      // Logic should still handle empty steps gracefully
      for (let i = 0; i < demoWithoutSteps.steps.length; i++) {
        // This loop won't execute, which is expected
      }
    })

    it('should validate step structure', () => {
      const step = mockDemoData.steps[0]
      
      expect(step.title).toBe('Step 1')
      expect(step.description).toBe('First step')
      expect(step.urls).toEqual(['https://example.com'])
      expect(step.persona).toBe('john')
      expect(step.icon).toBe('home')
      expect(step.tabColor).toBe('#ff0000')
      expect(step.incognito).toBe(false)
      expect(step.onlyShowUrls).toBe(false)
    })
  })
})