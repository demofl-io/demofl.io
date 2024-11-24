// js/content/init.js
import { connectToBackground } from './port.js';
import { checkStoredPersona } from './storage.js';

export let currentTabId;

export function init() {
    chrome.runtime.sendMessage({ action: "getTabId" }, async (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting tab ID:", chrome.runtime.lastError);
          setTimeout(init, 1000);
          return;
        }
        
        if (response && response.tabId) {
          currentTabId = response.tabId;
          
          // Connect to background first
          if (connectToBackground()) {
            // Always check for stored persona data
            await checkStoredPersona();
          }
        } else {
          console.error("No tab ID received");
          setTimeout(init, 1000);
        }
      });
}