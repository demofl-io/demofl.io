import { parseDemoFile } from './popup/parser.js';

// When this page loads, get the pending template and process it
window.addEventListener('load', async () => {
    try {
        const result = await chrome.storage.local.get('pendingTemplate');
        if (result.pendingTemplate) {
            await parseDemoFile(result.pendingTemplate);
            // Clear the pending template
            await chrome.storage.local.remove('pendingTemplate');
            
            // Close this processor tab
            chrome.tabs.getCurrent(tab => {
                if (tab) {
                    chrome.tabs.remove(tab.id);
                }
            });
        }
    } catch (error) {
        console.error('Error processing template:', error);
    }
});