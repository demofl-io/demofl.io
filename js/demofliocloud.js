
console.log("Content script loaded on DEMOCLOUD:", window.location.href);
window.addEventListener('DOMContentLoaded', function () {

    
    // Listen for messages from the website
    window.addEventListener('message', (event) => {
        // Only accept messages from your domain
        //if (event.origin !== 'https://your-website-domain.com') return;

        // Handle different action types
        switch (event.data.type) {
            case 'EXTENSION_RUNDEMO':
                // Forward the message to extension background script
                chrome.runtime.sendMessage({
                    type: 'EXTENSION_RUNDEMO',
                    payload: event.data.payload
                });
                break;
        }
    });

    // Inject a script to help the website detect extension presence
    window.postMessage({
        type: 'EXTENSION_INSTALLED',
        payload: true
    }, '*');
});

