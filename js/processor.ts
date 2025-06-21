import { parseDemoFile } from './popup/parser.js';
import { clearTabs } from './popup/list.js';
import { DemoFlowTemplate, StorageResult } from './types.js';

// When this page loads, get the pending template and process it
window.addEventListener('load', async (): Promise<void> => {
    try {
        clearTabs();
        const result: StorageResult = await chrome.storage.local.get('pendingTemplate');
        if (result.pendingTemplate) {
            await parseDemoFile(result.pendingTemplate as DemoFlowTemplate);
            // Clear the pending template
           // await chrome.storage.local.remove('pendingTemplate');
            
            // Close this processor tab
            chrome.tabs.getCurrent((tab?: chrome.tabs.Tab) => {
                if (tab && tab.id) {
                    chrome.tabs.remove(tab.id);
                }
            });
        }
    } catch (error) {
        console.error('Error processing template:', error);
    }
});