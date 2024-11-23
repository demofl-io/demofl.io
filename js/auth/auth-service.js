import { ZITADEL_CONFIG } from './zitadel-config.js';

export class AuthService {
    constructor() {
        this.config = ZITADEL_CONFIG;
    }

    async generateCodeChallenge() {
        const codeVerifier = this.generateCodeVerifier();
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        const base64Url = btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        
        return {
            codeVerifier,
            codeChallenge: base64Url
        };
    }

    generateCodeVerifier() {
        const array = new Uint32Array(56);
        crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    }

    async initiateLogin() {
        const { codeVerifier, codeChallenge } = await this.generateCodeChallenge();
        
        // Store code verifier for later use
        await chrome.storage.local.set({ codeVerifier });

        const params = new URLSearchParams({
            client_id: this.config.client_id,
            response_type: 'code',
            scope: this.config.scope,
            redirect_uri: this.config.redirect_uri,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        return `${this.config.authorization_endpoint}?${params.toString()}`;
    }

    async handleCallback(code) {
        const { codeVerifier } = await chrome.storage.local.get('codeVerifier');
        
        const tokenResponse = await fetch(this.config.token_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: this.config.client_id,
                code_verifier: codeVerifier,
                code: code,
                redirect_uri: this.config.redirect_uri
            })
        });

        if (!tokenResponse.ok) {
            throw new Error('Token exchange failed');
        }

        const tokens = await tokenResponse.json();
        await this.storeTokens(tokens);
        return tokens;
    }

    async storeTokens(tokens) {
        await chrome.storage.local.set({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            id_token: tokens.id_token,
            expires_at: Date.now() + (tokens.expires_in * 1000)
        });
    }

    async getTokens() {
        return chrome.storage.local.get([
            'access_token',
            'refresh_token',
            'id_token',
            'expires_at'
        ]);
    }

    async isAuthenticated() {
        const { access_token, expires_at } = await this.getTokens();
        return access_token && expires_at && Date.now() < expires_at;
    }

    async signOut() {
        await chrome.storage.local.remove(['access_token', 'refresh_token']);
        // Optional: Clear any other stored auth data
        return true;
    }
}