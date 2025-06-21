import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Chrome Extension Storage and Messaging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Storage Operations', () => {
    it('should save data to local storage', async () => {
      const testData = { key: 'value', number: 42 }
      
      await chrome.storage.local.set(testData)
      
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith(testData)
    })

    it('should retrieve data from local storage', async () => {
      const expectedData = { demo: { name: 'Test Demo' } }
      global.chrome.storage.local.get.mockResolvedValueOnce(expectedData)
      
      const result = await chrome.storage.local.get('demo')
      
      expect(result).toEqual(expectedData)
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith('demo')
    })

    it('should retrieve multiple keys from storage', async () => {
      const expectedData = { 
        demo: { name: 'Test' },
        userTemplates: [],
        settings: { theme: 'dark' }
      }
      global.chrome.storage.local.get.mockResolvedValueOnce(expectedData)
      
      const result = await chrome.storage.local.get(['demo', 'userTemplates', 'settings'])
      
      expect(result).toEqual(expectedData)
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith(['demo', 'userTemplates', 'settings'])
    })

    it('should remove data from storage', async () => {
      await chrome.storage.local.remove(['access_token', 'refresh_token'])
      
      expect(global.chrome.storage.local.remove).toHaveBeenCalledWith(['access_token', 'refresh_token'])
    })

    it('should clear all storage', async () => {
      await chrome.storage.local.clear()
      
      expect(global.chrome.storage.local.clear).toHaveBeenCalled()
    })

    it('should handle storage errors', async () => {
      global.chrome.storage.local.set.mockRejectedValueOnce(new Error('Storage quota exceeded'))
      
      await expect(chrome.storage.local.set({ large: 'data' })).rejects.toThrow('Storage quota exceeded')
    })
  })

  describe('Runtime Messaging', () => {
    it('should send runtime messages', async () => {
      const message = { type: 'AUTH_SUCCESS', data: 'test' }
      
      await chrome.runtime.sendMessage(message)
      
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(message)
    })

    it('should send messages with callback', () => {
      const message = { type: 'GET_TAB_ID' }
      const callback = vi.fn()
      
      chrome.runtime.sendMessage(message, callback)
      
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(message, callback)
    })

    it('should add message listeners', () => {
      const listener = vi.fn()
      
      chrome.runtime.onMessage.addListener(listener)
      
      expect(global.chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(listener)
    })

    it('should remove message listeners', () => {
      const listener = vi.fn()
      
      chrome.runtime.onMessage.removeListener(listener)
      
      expect(global.chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(listener)
    })

    it('should check if listener exists', () => {
      const listener = vi.fn()
      global.chrome.runtime.onMessage.hasListener.mockReturnValueOnce(true)
      
      const hasListener = chrome.runtime.onMessage.hasListener(listener)
      
      expect(hasListener).toBe(true)
      expect(global.chrome.runtime.onMessage.hasListener).toHaveBeenCalledWith(listener)
    })

    it('should get extension URL', () => {
      const path = '/html/popup.html'
      global.chrome.runtime.getURL.mockReturnValueOnce(`chrome-extension://test-id${path}`)
      
      const url = chrome.runtime.getURL(path)
      
      expect(url).toBe('chrome-extension://test-id/html/popup.html')
      expect(global.chrome.runtime.getURL).toHaveBeenCalledWith(path)
    })
  })

  describe('Tab Management', () => {
    it('should create new tabs', async () => {
      const createInfo = {
        url: 'https://example.com',
        active: true,
        windowId: 1
      }
      global.chrome.tabs.create.mockResolvedValueOnce({ id: 123, ...createInfo })
      
      const tab = await chrome.tabs.create(createInfo)
      
      expect(tab.id).toBe(123)
      expect(global.chrome.tabs.create).toHaveBeenCalledWith(createInfo)
    })

    it('should remove tabs', async () => {
      const tabId = 123
      
      await chrome.tabs.remove(tabId)
      
      expect(global.chrome.tabs.remove).toHaveBeenCalledWith(tabId)
    })

    it('should send messages to tabs', async () => {
      const tabId = 123
      const message = { type: 'INJECT_SCRIPT' }
      
      await chrome.tabs.sendMessage(tabId, message)
      
      expect(global.chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, message)
    })

    it('should query tabs', async () => {
      const queryInfo = { active: true, currentWindow: true }
      const expectedTabs = [{ id: 123, url: 'https://example.com' }]
      global.chrome.tabs.query.mockResolvedValueOnce(expectedTabs)
      
      const tabs = await chrome.tabs.query(queryInfo)
      
      expect(tabs).toEqual(expectedTabs)
      expect(global.chrome.tabs.query).toHaveBeenCalledWith(queryInfo)
    })

    it('should listen for tab updates', () => {
      const listener = vi.fn()
      
      chrome.tabs.onUpdated.addListener(listener)
      
      expect(global.chrome.tabs.onUpdated.addListener).toHaveBeenCalledWith(listener)
    })
  })

  describe('Window Management', () => {
    it('should create new windows', async () => {
      const createData = { incognito: true }
      const expectedWindow = { id: 2, incognito: true }
      global.chrome.windows.create.mockResolvedValueOnce(expectedWindow)
      
      const window = await chrome.windows.create(createData)
      
      expect(window).toEqual(expectedWindow)
      expect(global.chrome.windows.create).toHaveBeenCalledWith(createData)
    })

    it('should get current window', async () => {
      const expectedWindow = { id: 1, focused: true }
      global.chrome.windows.getCurrent.mockResolvedValueOnce(expectedWindow)
      
      const window = await chrome.windows.getCurrent()
      
      expect(window).toEqual(expectedWindow)
      expect(global.chrome.windows.getCurrent).toHaveBeenCalled()
    })

    it('should get all windows', async () => {
      const expectedWindows = [
        { id: 1, focused: true },
        { id: 2, incognito: true }
      ]
      global.chrome.windows.getAll.mockResolvedValueOnce(expectedWindows)
      
      const windows = await chrome.windows.getAll()
      
      expect(windows).toEqual(expectedWindows)
      expect(global.chrome.windows.getAll).toHaveBeenCalled()
    })
  })

  describe('Tab Groups', () => {
    it('should create tab groups', async () => {
      const createOptions = { tabIds: [1, 2, 3] }
      const expectedGroup = { id: 1, tabIds: [1, 2, 3] }
      global.chrome.tabGroups.create.mockResolvedValueOnce(expectedGroup)
      
      const group = await chrome.tabGroups.create(createOptions)
      
      expect(group).toEqual(expectedGroup)
      expect(global.chrome.tabGroups.create).toHaveBeenCalledWith(createOptions)
    })

    it('should update tab groups', async () => {
      const groupId = 1
      const updateOptions = { title: 'Demo Step 1', color: 'red' }
      
      await chrome.tabGroups.update(groupId, updateOptions)
      
      expect(global.chrome.tabGroups.update).toHaveBeenCalledWith(groupId, updateOptions)
    })
  })

  describe('Event Listeners', () => {
    it('should add startup listeners', () => {
      const listener = vi.fn()
      
      chrome.runtime.onStartup.addListener(listener)
      
      expect(global.chrome.runtime.onStartup.addListener).toHaveBeenCalledWith(listener)
    })

    it('should add installation listeners', () => {
      const listener = vi.fn()
      
      chrome.runtime.onInstalled.addListener(listener)
      
      expect(global.chrome.runtime.onInstalled.addListener).toHaveBeenCalledWith(listener)
    })

    it('should add connect listeners', () => {
      const listener = vi.fn()
      
      chrome.runtime.onConnect.addListener(listener)
      
      expect(global.chrome.runtime.onConnect.addListener).toHaveBeenCalledWith(listener)
    })

    it('should add command listeners', () => {
      const listener = vi.fn()
      
      chrome.commands.onCommand.addListener(listener)
      
      expect(global.chrome.commands.onCommand.addListener).toHaveBeenCalledWith(listener)
    })
  })

  describe('Error Handling', () => {
    it('should handle runtime errors', () => {
      global.chrome.runtime.lastError = { message: 'Test error' }
      
      expect(chrome.runtime.lastError?.message).toBe('Test error')
    })

    it('should handle tab creation errors', async () => {
      global.chrome.tabs.create.mockRejectedValueOnce(new Error('Failed to create tab'))
      
      await expect(chrome.tabs.create({ url: 'invalid-url' })).rejects.toThrow('Failed to create tab')
    })

    it('should handle storage errors', async () => {
      global.chrome.storage.local.get.mockRejectedValueOnce(new Error('Storage access denied'))
      
      await expect(chrome.storage.local.get('test')).rejects.toThrow('Storage access denied')
    })
  })
})