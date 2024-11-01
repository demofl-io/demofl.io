// js/content/index.js
import { init, currentTabId } from './init.js';
import { checkStoredPersona } from './storage.js';
import { createPersonaOverlay } from './overlay.js';

console.log("Content script loaded on:", window.location.href);

// Start initialization and check for stored persona
async function initialize() {
  await init();
  await checkStoredPersona(currentTabId);
}

initialize();

// Visibility change listener
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'hidden') {
    console.log("Tab becoming hidden");
  } else {
    console.log("Tab becoming visible, checking stored persona");
    await checkStoredPersona(currentTabId);
  }
});

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showPersona") {
    console.log("Received showPersona message:", request.persona);
    
    chrome.storage.local.get(["personaTabs"], (result) => {
      const personaTabs = result.personaTabs || {};
      personaTabs[currentTabId] = request.persona;
      
      chrome.storage.local.set({ personaTabs }, () => {
        createPersonaOverlay(request.persona);
        sendResponse({ success: true });
      });
    });
    return true;
  }
});

// Handle reload/navigation
window.addEventListener('load', async () => {
  console.log("Page loaded, checking for stored persona");
  await checkStoredPersona(currentTabId);
});