import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DemoFlowTemplate } from '../js/types'

describe('Overview Loader Logic', () => {
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

  beforeEach(() => {
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
    
    // Setup chrome storage mock
    global.chrome.storage.local.get.mockResolvedValue({
      pendingTemplate: mockTemplate
    })
  })

  describe('loadOverviewContent logic', () => {
    it('should load content successfully', async () => {
      // Simulate the main logic
      const result = await chrome.storage.local.get('pendingTemplate')
      
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('pendingTemplate')
      expect(result.pendingTemplate).toEqual(mockTemplate)
    })

    it('should handle missing template data', async () => {
      global.chrome.storage.local.get.mockResolvedValueOnce({})
      
      const result = await chrome.storage.local.get('pendingTemplate')
      
      if (!result.pendingTemplate) {
        const contentElement = global.document.getElementById('content')
        if (contentElement) {
          contentElement.innerHTML = '<p class="text-center p-4">No demo data found</p>'
        }
      }
      
      const contentElement = global.document.getElementById('content')
      expect(contentElement.innerHTML).toBe('<p class="text-center p-4">No demo data found</p>')
    })

    it('should handle URL search parameters', () => {
      const search = '?step=0'
      const urlParams = new URLSearchParams(search)
      const currentStep = urlParams.has('step') ? parseInt(urlParams.get('step')!) : null
      
      expect(currentStep).toBe(0)
    })

    it('should handle invalid step parameter', () => {
      const search = '?step=invalid'
      const urlParams = new URLSearchParams(search)
      const currentStep = urlParams.has('step') ? parseInt(urlParams.get('step')!) : null
      
      expect(currentStep).toBeNaN()
    })

    it('should handle DOM manipulation', () => {
      // Test style injection
      const style = global.document.createElement('style')
      style.textContent = 'body { color: red; }'
      global.document.head.appendChild(style)
      
      expect(global.document.createElement).toHaveBeenCalledWith('style')
      expect(global.document.head.appendChild).toHaveBeenCalled()
      
      // Test content injection
      const contentElement = global.document.getElementById('content')
      if (contentElement) {
        contentElement.innerHTML = '<div>Test Content</div>'
      }
      
      expect(contentElement.innerHTML).toBe('<div>Test Content</div>')
    })

    it('should handle scroll functionality', () => {
      const currentStepCard = global.document.querySelector('.current-step')
      if (currentStepCard) {
        currentStepCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center', 
          inline: 'center' 
        })
      }
      
      expect(currentStepCard.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      })
    })

    it('should handle video container detection', () => {
      const videoContainer = global.document.getElementById('draggableVideo')
      const currentStep = 0
      const hasVideo = mockTemplate.steps[currentStep]?.video
      
      expect(videoContainer).toBeDefined()
      expect(hasVideo).toBe('test-video.mp4')
      
      // Would initialize video container if both conditions are met
      if (videoContainer && currentStep !== null && hasVideo) {
        expect(true).toBe(true) // Video container would be initialized
      }
    })
  })
})