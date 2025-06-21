import { ExtensionMessage } from '../types.js';

// Listen for messages from the callback page
window.addEventListener('message', (event: MessageEvent): void => {
    // Only accept messages from our callback page
    if (event.origin !== 'https://my.demofl.io') return;
    
    if (event.data.type === 'ZITADEL_AUTH_CODE') {
        // Forward the auth code to the extension's background script
        chrome.runtime.sendMessage({
            type: 'ZITADEL_AUTH_CODE',
            code: event.data.code
        } as ExtensionMessage);
        // Don't try to close window here
    }
});

// Handle the auth code directly instead of injecting a script
function handleAuthCode(): void {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        window.postMessage({ 
            type: 'ZITADEL_AUTH_CODE', 
            code: code 
        }, 'https://my.demofl.io');
    }
}

// Execute the code check when the content script loads
handleAuthCode();