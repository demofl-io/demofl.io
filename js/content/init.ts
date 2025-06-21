// js/content/init.ts
import { connectToBackground } from './port.js';
import { checkStoredPersona } from './storage.js';

export let currentTabId: number;

export function init(): Promise<void> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "getTabId" }, async (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error getting tab ID:", chrome.runtime.lastError);
              setTimeout(() => init().then(resolve), 1000);
              return;
            }
            
            if (response && response.tabId) {
              currentTabId = response.tabId;
              
              // Connect to background first
              if (connectToBackground()) {
                // Always check for stored persona data
                await checkStoredPersona(currentTabId);
              }
              resolve();
            } else {
              console.error("No tab ID received");
              setTimeout(() => init().then(resolve), 1000);
            }
          });
    });
}