import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DemoFlowTemplate } from '../js/types'

// Mock dependencies
vi.mock('../js/popup/templates/index.js', () => ({
  generateOverviewHTML: vi.fn().mockResolvedValue({
    styles: 'body { color: red; }',
    content: '<div>Test Content</div>'
  })
}))

vi.mock('../js/components/theme', () => ({
  initializeTheme: vi.fn()
}))

vi.mock('../js/components/video-container', () => ({
  VideoContainer: vi.fn()
}))

describe('Overview Loader', () => {
  let loadOverviewContent: any
  
  const mockTemplate: DemoFlowTemplate = {
    customer: { name: 'Test Customer', logourl: 'test.png' },
    product: { name: 'Test Product', logourl: 'test.png' },
    personas: {},
    steps: [
      {
        title: 'Step 1',
        description: 'First step',
        urls: ['https://example.com'],
        persona: 'john',
        icon: 'home',
        tabColor: '#ff0000',
        incognito: false,
        onlyShowUrls: false,
        video: 'test-video.mp4'
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
    
    // Mock DOM
    const mockContentElement = {
      innerHTML: ''
    }
    
    const mockVideoContainer = document.createElement('div')
    mockVideoContainer.id = 'draggableVideo'
    
    const mockCurrentStepCard = document.createElement('div')
    mockCurrentStepCard.className = 'current-step'
    mockCurrentStepCard.scrollIntoView = vi.fn()
    
    global.document = {
      getElementById: vi.fn((id) => {
        if (id === 'content') return mockContentElement
        if (id === 'draggableVideo') return mockVideoContainer
        return null
      }),
      querySelector: vi.fn((selector) => {
        if (selector === '.current-step') return mockCurrentStepCard
        return null
      }),
      createElement: vi.fn((tag) => {
        const element = { textContent: '', appendChild: vi.fn() }
        return element
      }),
      head: { appendChild: vi.fn() },
      body: {}
    } as any
    
    // Mock URLSearchParams
    global.URLSearchParams = vi.fn().mockImplementation((search) => ({
      has: vi.fn((key) => key === 'step' && search.includes('step=')),
      get: vi.fn((key) => key === 'step' ? '0' : null)
    })) as any
    
    // Mock window.location
    global.window = {
      location: { search: '?step=0' }
    } as any
    
    // Setup chrome storage mock
    global.chrome.storage.local.get.mockResolvedValue({
      pendingTemplate: mockTemplate
    })
    
    // Dynamically import the module
    const overviewModule = await import('../js/popup/overview-loader')
    loadOverviewContent = overviewModule.loadOverviewContent || (() => Promise.resolve())
  })

  describe('loadOverviewContent', () => {
    it('should load content successfully with step parameter', async () => {
      const { generateOverviewHTML } = await import('../js/popup/templates/index.js')
      const { initializeTheme } = await import('../js/components/theme')
      
      await loadOverviewContent()
      
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('pendingTemplate')
      expect(generateOverviewHTML).toHaveBeenCalledWith(mockTemplate, 0)
      expect(initializeTheme).toHaveBeenCalled()
    })

    it('should handle missing template data', async () => {
      global.chrome.storage.local.get.mockResolvedValueOnce({})
      
      await loadOverviewContent()
      
      const contentElement = global.document.getElementById('content')
      expect(contentElement.innerHTML).toBe('<p class="text-center p-4">No demo data found</p>')
    })

    it('should scroll current step into view', async () => {
      await loadOverviewContent()
      
      const currentStepCard = global.document.querySelector('.current-step')
      expect(currentStepCard.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      })
    })

    it('should initialize video container when step has video', async () => {
      const { VideoContainer } = await import('../js/components/video-container')
      
      await loadOverviewContent()
      
      expect(VideoContainer).toHaveBeenCalled()
    })

    it('should not initialize video container when no current step', async () => {
      global.window.location.search = ''
      global.URLSearchParams = vi.fn().mockImplementation(() => ({
        has: vi.fn().mockReturnValue(false),
        get: vi.fn().mockReturnValue(null)
      })) as any
      
      const { VideoContainer } = await import('../js/components/video-container')
      
      await loadOverviewContent()
      
      expect(VideoContainer).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      global.chrome.storage.local.get.mockRejectedValueOnce(new Error('Storage error'))
      
      await loadOverviewContent()
      
      expect(consoleSpy).toHaveBeenCalledWith('Error loading overview:', expect.any(Error))
      
      const contentElement = global.document.getElementById('content')
      expect(contentElement.innerHTML).toContain('Error loading demo content')
      
      consoleSpy.mockRestore()
    })

    it('should add styles to document head', async () => {
      await loadOverviewContent()
      
      expect(global.document.createElement).toHaveBeenCalledWith('style')
      expect(global.document.head.appendChild).toHaveBeenCalled()
    })

    it('should set content HTML', async () => {
      await loadOverviewContent()
      
      const contentElement = global.document.getElementById('content')
      expect(contentElement.innerHTML).toBe('<div>Test Content</div>')
    })

    it('should handle step parameter parsing', async () => {
      global.window.location.search = '?step=2'
      global.URLSearchParams = vi.fn().mockImplementation(() => ({
        has: vi.fn((key) => key === 'step'),
        get: vi.fn((key) => key === 'step' ? '2' : null)
      })) as any
      
      const { generateOverviewHTML } = await import('../js/popup/templates/index.js')
      
      await loadOverviewContent()
      
      expect(generateOverviewHTML).toHaveBeenCalledWith(mockTemplate, 2)
    })

    it('should handle invalid step parameter', async () => {
      global.window.location.search = '?step=invalid'
      global.URLSearchParams = vi.fn().mockImplementation(() => ({
        has: vi.fn((key) => key === 'step'),
        get: vi.fn((key) => key === 'step' ? 'invalid' : null)
      })) as any
      
      const { generateOverviewHTML } = await import('../js/popup/templates/index.js')
      
      await loadOverviewContent()
      
      // Should pass NaN which gets handled as null
      expect(generateOverviewHTML).toHaveBeenCalledWith(mockTemplate, NaN)
    })
  })
})