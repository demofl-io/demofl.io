import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DemoFlowTemplate } from '../js/types'

// Mock dependencies
vi.mock('../js/popup/templates.js', () => ({
  demoFolder: 'demos'
}))

vi.mock('../js/popup/templates/index.js', () => ({
  generateOverviewHTML: vi.fn(),
  generatePersonasHTML: vi.fn()
}))

describe('Parser', () => {
  let parseDemoFile: any
  let openJSONFile: any
  let saveDemoToLocalStorage: any
  
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

  beforeEach(async () => {
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
    
    // Dynamically import the module after mocks are set up
    const parserModule = await import('../js/popup/parser')
    parseDemoFile = parserModule.parseDemoFile
    openJSONFile = parserModule.openJSONFile
    saveDemoToLocalStorage = parserModule.saveDemoToLocalStorage
  })

  describe('saveDemoToLocalStorage', () => {
    it('should save demo data to chrome storage', async () => {
      await saveDemoToLocalStorage(mockDemoData)
      
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        demo: mockDemoData
      })
    })
  })

  describe('openJSONFile', () => {
    it('should open builtin JSON file', async () => {
      await openJSONFile('builtin:template1')
      
      expect(global.fetch).toHaveBeenCalledWith('chrome-extension://test-id/demos/template1.json')
    })

    it('should open user template from storage', async () => {
      const userTemplates = {
        'custom-template': mockDemoData
      }
      
      global.chrome.storage.local.get.mockResolvedValueOnce({ userTemplates })
      
      await openJSONFile('user:custom-template')
      
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('userTemplates')
    })
  })

  describe('parseDemoFile', () => {
    it('should create overview and personas tabs', async () => {
      await parseDemoFile(mockDemoData)
      
      // Should save to storage first
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        demo: mockDemoData
      })
      
      // Should create overview tab
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({
        active: true,
        url: 'chrome-extension://test-id/html/overview.html',
        windowId: 1
      })
      
      // Should create personas tab
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({
        active: false,
        url: 'chrome-extension://test-id/html/personas.html',
        windowId: 1
      })
    })

    it('should create tabs for regular steps', async () => {
      await parseDemoFile(mockDemoData)
      
      // Should create step overview tabs
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({
        active: true,
        url: 'chrome-extension://test-id/html/overview.html?step=0',
        windowId: 1
      })
      
      // Should create URL tabs for first step
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({
        active: false,
        url: 'https://example.com',
        windowId: 1
      })
    })

    it('should create incognito window for incognito steps', async () => {
      await parseDemoFile(mockDemoData)
      
      // Should create incognito window for second step
      expect(global.chrome.windows.create).toHaveBeenCalledWith({ incognito: true })
      
      // Should create tabs in incognito window
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({
        active: false,
        url: 'https://test.com',
        windowId: 2
      })
      
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({
        active: false,
        url: 'https://demo.com',
        windowId: 2
      })
    })

    it('should create tab groups for steps with multiple URLs', async () => {
      await parseDemoFile(mockDemoData)
      
      // Should create tab group for steps with multiple URLs
      expect(global.chrome.tabGroups.create).toHaveBeenCalled()
      expect(global.chrome.tabGroups.update).toHaveBeenCalled()
    })

    it('should handle steps without URLs', async () => {
      const demoWithoutUrls: DemoFlowTemplate = {
        ...mockDemoData,
        steps: [
          {
            title: 'Step without URLs',
            description: 'No URLs',
            urls: [],
            persona: 'john',
            icon: 'info',
            tabColor: '#0000ff',
            incognito: false,
            onlyShowUrls: false
          }
        ]
      }
      
      await parseDemoFile(demoWithoutUrls)
      
      // Should still create overview tabs even without URLs
      expect(global.chrome.tabs.create).toHaveBeenCalledWith({
        active: true,
        url: 'chrome-extension://test-id/html/overview.html?step=0',
        windowId: 1
      })
    })

    it('should handle empty steps array', async () => {
      const demoWithoutSteps: DemoFlowTemplate = {
        ...mockDemoData,
        steps: []
      }
      
      await parseDemoFile(demoWithoutSteps)
      
      // Should still create initial overview and personas tabs
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

    it('should handle errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Make tabs.create fail
      global.chrome.tabs.create.mockRejectedValueOnce(new Error('Tab creation failed'))
      
      await expect(parseDemoFile(mockDemoData)).rejects.toThrow('Tab creation failed')
      
      consoleSpy.mockRestore()
    })
  })
})