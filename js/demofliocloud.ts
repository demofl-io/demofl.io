
import { ExtensionMessage } from './types.js';

console.log("Content script loaded on DEMOCLOUD:", window.location.href);
window.addEventListener('DOMContentLoaded', function (): void {

    
    // Listen for messages from the website
    window.addEventListener('message', (event: MessageEvent): void => {
        // Only accept messages from your domain
        //if (event.origin !== 'https://your-website-domain.com') return;

        // Handle different action types
        switch (event.data.type) {
            case 'EXTENSION_RUNDEMO':
                // Forward the message to extension background script
                chrome.runtime.sendMessage({
                    type: 'EXTENSION_RUNDEMO',
                    payload: event.data.payload
                } as ExtensionMessage);
                break;
        }
    });

    // Inject a script to help the website detect extension presence
    window.postMessage({
        type: 'EXTENSION_INSTALLED',
        payload: true
    }, '*');
});

