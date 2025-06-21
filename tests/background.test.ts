import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExtensionMessage, DemoFlowTemplate } from '../js/types'

// Mock ExtPay before importing background script
vi.mock('extpay', () => ({
  default: vi.fn(() => ({
    startBackground: vi.fn()
  }))
}))

// Mock AuthService
vi.mock('../js/auth', () => ({
  AuthService: vi.fn(() => ({
    handleCallback: vi.fn()
  }))
}))

describe('Background Script', () => {
  let authServiceMock: any
  let backgroundScript: any
  
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Reset chrome mocks
    global.chrome.runtime.sendMessage.mockClear()
    global.chrome.storage.local.set.mockClear()
    global.chrome.tabs.create.mockClear()
    global.chrome.tabs.remove.mockClear()
    
    // Setup fetch mock for demo template
    const mockTemplate: DemoFlowTemplate = {
      customer: { name: 'Test Customer', logourl: 'test.png' },
      product: { name: 'Test Product', logourl: 'test.png' },
      personas: {},
      steps: [],
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
    
    global.fetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockTemplate)
    } as any)

    // Import background script to register listeners
    backgroundScript = await import('../js/background')
  })

  it('should handle getTabId message correctly', async () => {
    const sendResponse = vi.fn()
    const sender = { tab: { id: 123 } }
    const request: ExtensionMessage = { action: 'getTabId', type: '' }
    
    // Get the first listener that was registered
    const messageListeners = global.chrome.runtime.onMessage.addListener.mock.calls
    expect(messageListeners.length).toBeGreaterThan(0)
    const messageListener = messageListeners[0][0]
    
    const result = messageListener(request, sender, sendResponse)
    
    expect(sendResponse).toHaveBeenCalledWith({ tabId: 123 })
    expect(result).toBe(true)
  })

  it('should handle getTabId message when no tab ID available', async () => {
    const sendResponse = vi.fn()
    const sender = {} // No tab info
    const request: ExtensionMessage = { action: 'getTabId', type: '' }
    
    const messageListeners = global.chrome.runtime.onMessage.addListener.mock.calls
    const messageListener = messageListeners[0][0]
    
    const result = messageListener(request, sender, sendResponse)
    
    expect(sendResponse).toHaveBeenCalledWith({ error: 'No tab ID available' })
    expect(result).toBe(true)
  })

  it('should broadcast AUTH_SUCCESS message', async () => {
    const sendResponse = vi.fn()
    const request: ExtensionMessage = { type: 'AUTH_SUCCESS' }
    
    const messageListeners = global.chrome.runtime.onMessage.addListener.mock.calls
    const messageListener = messageListeners[0][0]
    
    messageListener(request, {}, sendResponse)
    
    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'AUTH_SUCCESS' })
  })

  it('should handle ZITADEL_AUTH_CODE message', async () => {
    const { AuthService } = await import('../js/auth')
    authServiceMock = new AuthService()
    
    const sendResponse = vi.fn()
    const request: ExtensionMessage = { type: 'ZITADEL_AUTH_CODE', code: 'test-code' }
    
    const messageListeners = global.chrome.runtime.onMessage.addListener.mock.calls
    const messageListener = messageListeners[0][0]
    
    messageListener(request, {}, sendResponse)
    
    expect(authServiceMock.handleCallback).toHaveBeenCalledWith('test-code')
  })

  it('should handle EXTENSION_RUNDEMO message', async () => {
    const sendResponse = vi.fn()
    const request: ExtensionMessage = { 
      type: 'EXTENSION_RUNDEMO', 
      payload: { test: 'data' } 
    }
    
    // Get the second message listener (async one) if it exists
    const messageListeners = global.chrome.runtime.onMessage.addListener.mock.calls
    const messageListener = messageListeners.length > 1 ? messageListeners[1][0] : messageListeners[0][0]
    
    await messageListener(request, {}, sendResponse)
    
    expect(global.fetch).toHaveBeenCalledWith('chrome-extension://test-id/demos/template1.json')
    expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ 
      pendingTemplate: expect.any(Object) 
    })
    expect(global.chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test-id/html/processor.html',
      active: true
    })
  })

  it('should handle ZITADEL_AUTH_CODE in async listener and close auth tab', async () => {
    const { AuthService } = await import('../js/auth')
    authServiceMock = new AuthService()
    
    const sendResponse = vi.fn()
    const sender = { tab: { id: 456 } }
    const request: ExtensionMessage = { type: 'ZITADEL_AUTH_CODE', code: 'auth-code' }
    
    // Get the second message listener (async one) if it exists
    const messageListeners = global.chrome.runtime.onMessage.addListener.mock.calls
    const messageListener = messageListeners.length > 1 ? messageListeners[1][0] : messageListeners[0][0]
    
    await messageListener(request, sender, sendResponse)
    
    expect(authServiceMock.handleCallback).toHaveBeenCalledWith('auth-code')
    expect(global.chrome.tabs.remove).toHaveBeenCalledWith(456)
    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'AUTH_SUCCESS' })
  })

  it('should handle auth callback errors gracefully', async () => {
    const { AuthService } = await import('../js/auth')
    authServiceMock = new AuthService()
    authServiceMock.handleCallback.mockRejectedValue(new Error('Auth failed'))
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const sendResponse = vi.fn()
    const sender = { tab: { id: 456 } }
    const request: ExtensionMessage = { type: 'ZITADEL_AUTH_CODE', code: 'bad-code' }
    
    const messageListeners = global.chrome.runtime.onMessage.addListener.mock.calls
    const messageListener = messageListeners.length > 1 ? messageListeners[1][0] : messageListeners[0][0]
    
    await messageListener(request, sender, sendResponse)
    
    expect(consoleSpy).toHaveBeenCalledWith('Auth handling failed:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('should set up service worker keep-alive functionality', async () => {
    expect(global.chrome.runtime.onStartup.addListener).toHaveBeenCalled()
    expect(global.chrome.runtime.onConnect.addListener).toHaveBeenCalled()
  })

  it('should handle keepAlive port connection', async () => {
    const connectListeners = global.chrome.runtime.onConnect.addListener.mock.calls
    const connectListener = connectListeners[0][0]
    const mockPort = { name: 'keepAlive' }
    
    // Mock setTimeout
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation(() => 1 as any)
    
    connectListener(mockPort)
    
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 295000)
    
    setTimeoutSpy.mockRestore()
  })
})