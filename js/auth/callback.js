
import { AuthService } from './auth-service.js';

const authService = new AuthService();

async function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        try {
            await authService.handleCallback(code);
            // Close the popup and notify the main extension
            chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS' });
            window.close();
        } catch (error) {
            console.error('Authentication failed:', error);
            document.body.innerHTML = '<p>Authentication failed. Please try again.</p>';
        }
    } else {
        document.body.innerHTML = '<p>Invalid callback. Missing authorization code.</p>';
    }
}

handleCallback();