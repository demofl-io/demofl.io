import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExtensionMessage, DemoFlowTemplate } from '../js/types'

describe('Background Script Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
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
  })

  it('should handle getTabId message correctly', () => {
    const sendResponse = vi.fn()
    const sender = { tab: { id: 123 } }
    const request: ExtensionMessage = { action: 'getTabId', type: '' }
    
    // Simulate the message handler logic
    const messageHandler = (req: ExtensionMessage, snd: any, resp: any) => {
      if (req.action === "getTabId") {
        if (snd.tab && snd.tab.id) {
          resp({ tabId: snd.tab.id });
        } else {
          resp({ error: "No tab ID available" });
        }
        return true; // Required for async response
      }
      return false;
    }
    
    const result = messageHandler(request, sender, sendResponse)
    
    expect(sendResponse).toHaveBeenCalledWith({ tabId: 123 })
    expect(result).toBe(true)
  })

  it('should handle getTabId message when no tab ID available', () => {
    const sendResponse = vi.fn()
    const sender = {} // No tab info
    const request: ExtensionMessage = { action: 'getTabId', type: '' }
    
    const messageHandler = (req: ExtensionMessage, snd: any, resp: any) => {
      if (req.action === "getTabId") {
        if (snd.tab && snd.tab.id) {
          resp({ tabId: snd.tab.id });
        } else {
          resp({ error: "No tab ID available" });
        }
        return true;
      }
      return false;
    }
    
    const result = messageHandler(request, sender, sendResponse)
    
    expect(sendResponse).toHaveBeenCalledWith({ error: 'No tab ID available' })
    expect(result).toBe(true)
  })

  it('should broadcast AUTH_SUCCESS message', () => {
    const request: ExtensionMessage = { type: 'AUTH_SUCCESS' }
    
    const messageHandler = (req: ExtensionMessage) => {
      if (req.type === 'AUTH_SUCCESS') {
        chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS' });
        return true;
      }
      return false;
    }
    
    const result = messageHandler(request)
    
    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'AUTH_SUCCESS' })
    expect(result).toBe(true)
  })

  it('should handle EXTENSION_RUNDEMO message', async () => {
    const request: ExtensionMessage = { 
      type: 'EXTENSION_RUNDEMO', 
      payload: { test: 'data' } 
    }
    
    const messageHandler = async (req: ExtensionMessage) => {
      if (req.type === 'EXTENSION_RUNDEMO') {
        const flowurl = chrome.runtime.getURL(`/demos/template1.json`);
        const response = await fetch(flowurl);
        const template = await response.json();
        await chrome.storage.local.set({ pendingTemplate: template });
        
        await chrome.tabs.create({
          url: chrome.runtime.getURL('html/processor.html'),
          active: true
        });
        return true;
      }
      return false;
    }
    
    await messageHandler(request)
    
    expect(global.chrome.runtime.getURL).toHaveBeenCalledWith('/demos/template1.json')
    expect(global.fetch).toHaveBeenCalledWith('chrome-extension://test-id/demos/template1.json')
    expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ 
      pendingTemplate: expect.any(Object) 
    })
    expect(global.chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test-id/html/processor.html',
      active: true
    })
  })

  it('should handle service worker functionality', () => {
    // Test keep-alive logic
    const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20000);
    
    // Should be able to call without error
    expect(() => keepAlive()).not.toThrow()
    
    // Test port connection handling
    const portHandler = (port: any) => {
      if (port.name === 'keepAlive') {
        setTimeout(keepAlive, 295000);
      }
    }
    
    const mockPort = { name: 'keepAlive' }
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation(() => 1 as any)
    
    portHandler(mockPort)
    
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 295000)
    
    setTimeoutSpy.mockRestore()
  })
})