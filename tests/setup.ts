// Test setup with Chrome API mocks
import { vi } from 'vitest'

// Mock crypto for JSDOM environment
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
    },
    getRandomValues: vi.fn((array) => {
      // Fill with mock random values
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    })
  },
  writable: true
})

// Mock btoa
global.btoa = vi.fn((str) => Buffer.from(str, 'binary').toString('base64'))

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    id: 'test-extension-id',
    getURL: vi.fn((path: string) => `chrome-extension://test-id${path}`),
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn()
    },
    onInstalled: {
      addListener: vi.fn()
    },
    onStartup: {
      addListener: vi.fn()
    },
    onConnect: {
      addListener: vi.fn()
    },
    getPlatformInfo: vi.fn(),
    lastError: null
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn()
    }
  },
  tabs: {
    create: vi.fn(),
    remove: vi.fn(),
    sendMessage: vi.fn(),
    query: vi.fn(),
    group: vi.fn(),
    update: vi.fn(),
    onUpdated: {
      addListener: vi.fn()
    }
  },
  windows: {
    create: vi.fn(),
    getCurrent: vi.fn(),
    getAll: vi.fn()
  },
  commands: {
    onCommand: {
      addListener: vi.fn()
    }
  },
  tabGroups: {
    create: vi.fn(),
    update: vi.fn()
  }
}

// Set up global chrome object
global.chrome = mockChrome as any

// Mock fetch for HTTP requests
global.fetch = vi.fn()

// Setup default responses for common Chrome API calls
mockChrome.storage.local.get.mockResolvedValue({})
mockChrome.storage.local.set.mockResolvedValue(undefined)
mockChrome.storage.local.remove.mockResolvedValue(undefined)
mockChrome.tabs.create.mockResolvedValue({ id: 1, url: 'test-url' })
mockChrome.windows.getCurrent.mockResolvedValue({ id: 1 })