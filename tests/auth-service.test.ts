import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService, CodeChallenge, ClientConfig } from '../js/auth/auth-service'

// Mock zitadel config
vi.mock('../js/auth/zitadel-config.js', () => ({
  ZITADEL_CONFIG: {
    config_endpoint: 'https://test.example.com/config',
    token_endpoint: 'https://test.example.com/token'
  }
}))

describe('AuthService', () => {
  let authService: AuthService
  
  beforeEach(() => {
    vi.clearAllMocks()
    authService = new AuthService()
    
    // Reset storage mocks
    global.chrome.storage.local.get.mockClear()
    global.chrome.storage.local.set.mockClear()
    global.chrome.storage.local.remove.mockClear()
  })

  describe('generateCodeChallenge', () => {
    it('should generate code verifier and challenge', async () => {
      const result = await authService.generateCodeChallenge()
      
      expect(result).toHaveProperty('codeVerifier')
      expect(result).toHaveProperty('codeChallenge')
      expect(typeof result.codeVerifier).toBe('string')
      expect(typeof result.codeChallenge).toBe('string')
      expect(result.codeVerifier.length).toBeGreaterThan(0)
      expect(result.codeChallenge.length).toBeGreaterThan(0)
    })

    it('should generate different values on each call', async () => {
      const result1 = await authService.generateCodeChallenge()
      const result2 = await authService.generateCodeChallenge()
      
      expect(result1.codeVerifier).not.toBe(result2.codeVerifier)
      expect(result1.codeChallenge).not.toBe(result2.codeChallenge)
    })
  })

  describe('generateCodeVerifier', () => {
    it('should generate a hex string', () => {
      const verifier = authService.generateCodeVerifier()
      
      expect(typeof verifier).toBe('string')
      expect(verifier.length).toBeGreaterThan(0)
      expect(/^[a-f0-9]+$/i.test(verifier)).toBe(true)
    })
  })

  describe('getClientConfig', () => {
    it('should fetch client configuration', async () => {
      const mockConfig: ClientConfig = {
        client_id: 'test-client-id',
        redirect_uri: 'https://test.example.com/callback',
        scope: 'openid profile'
      }
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockConfig)
      } as any)
      
      const result = await authService.getClientConfig()
      
      expect(global.fetch).toHaveBeenCalledWith('https://test.example.com/config', {
        headers: {
          'x-extension-id': 'test-extension-id'
        }
      })
      expect(result).toEqual(mockConfig)
    })

    it('should throw error when fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as any)
      
      await expect(authService.getClientConfig()).rejects.toThrow('Failed to fetch auth config')
    })
  })

  describe('initiateLogin', () => {
    it('should generate login URL with correct parameters', async () => {
      const mockConfig: ClientConfig = {
        client_id: 'test-client-id',
        redirect_uri: 'https://test.example.com/callback',
        scope: 'openid profile',
        authorization_endpoint: 'https://test.example.com/auth'
      }
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockConfig)
      } as any)
      
      const result = await authService.initiateLogin()
      
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        codeVerifier: expect.any(String)
      })
      
      expect(result).toContain('https://test.example.com/auth?')
      expect(result).toContain('client_id=test-client-id')
      expect(result).toContain('response_type=code')
      expect(result).toContain('scope=openid%20profile')
      expect(result).toContain('code_challenge_method=S256')
    })
  })

  describe('handleCallback', () => {
    it('should exchange code for tokens', async () => {
      const mockConfig: ClientConfig = {
        client_id: 'test-client-id',
        redirect_uri: 'https://test.example.com/callback',
        scope: 'openid profile',
        token_endpoint: 'https://test.example.com/token'
      }
      
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        id_token: 'test-id-token',
        expires_in: 3600
      }
      
      global.chrome.storage.local.get.mockResolvedValueOnce({
        codeVerifier: 'test-code-verifier'
      })
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockConfig)
      } as any)
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokens)
      } as any)
      
      const result = await authService.handleCallback('test-auth-code')
      
      expect(result).toEqual(mockTokens)
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        id_token: 'test-id-token',
        expires_at: expect.any(Number)
      })
    })

    it('should handle token exchange failure', async () => {
      const mockConfig: ClientConfig = {
        client_id: 'test-client-id',
        token_endpoint: 'https://test.example.com/token',
        redirect_uri: 'https://test.example.com/callback',
        scope: 'openid'
      }
      
      global.chrome.storage.local.get.mockResolvedValueOnce({
        codeVerifier: 'test-code-verifier'
      })
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockConfig)
      } as any)
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Invalid code')
      } as any)
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await expect(authService.handleCallback('invalid-code')).rejects.toThrow()
      
      consoleSpy.mockRestore()
    })
  })

  describe('storeTokens', () => {
    it('should store tokens in chrome storage', async () => {
      const tokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        id_token: 'test-id-token',
        expires_in: 3600
      }
      
      await authService.storeTokens(tokens)
      
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        id_token: 'test-id-token',
        expires_at: expect.any(Number)
      })
    })
  })

  describe('getTokens', () => {
    it('should retrieve tokens from chrome storage', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        id_token: 'test-id-token',
        expires_at: Date.now() + 3600000
      }
      
      global.chrome.storage.local.get.mockResolvedValueOnce(mockTokens)
      
      const result = await authService.getTokens()
      
      expect(result).toEqual(mockTokens)
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith([
        'access_token',
        'refresh_token',
        'id_token',
        'expires_at'
      ])
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when access token is valid', async () => {
      global.chrome.storage.local.get.mockResolvedValueOnce({
        access_token: 'valid-token',
        expires_at: Date.now() + 3600000 // Not expired
      })
      
      const result = await authService.isAuthenticated()
      
      expect(result).toBe(true)
    })

    it('should return false when access token is expired', async () => {
      global.chrome.storage.local.get.mockResolvedValueOnce({
        access_token: 'expired-token',
        expires_at: Date.now() - 1000 // Expired
      })
      
      const result = await authService.isAuthenticated()
      
      expect(result).toBe(false)
    })

    it('should return false when no access token', async () => {
      global.chrome.storage.local.get.mockResolvedValueOnce({})
      
      const result = await authService.isAuthenticated()
      
      expect(result).toBe(false)
    })
  })

  describe('signOut', () => {
    it('should remove tokens from storage', async () => {
      await authService.signOut()
      
      expect(global.chrome.storage.local.remove).toHaveBeenCalledWith([
        'access_token',
        'refresh_token'
      ])
    })

    it('should return true on successful sign out', async () => {
      const result = await authService.signOut()
      
      expect(result).toBe(true)
    })
  })
})