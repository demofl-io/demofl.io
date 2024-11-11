// js/content/index.js
import { init, currentTabId } from './init.js';
import { checkStoredPersona } from './storage.js';
import { createPersonaOverlay } from './overlay/index.js';

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

// Handle keyboard shortcuts
document.addEventListener('keydown', async (e) => {
  // Debug log all key combinations
  console.log('Key pressed:', {
    key: e.key,
    ctrl: e.ctrlKey,
    alt: e.altKey,
    meta: e.metaKey,
    keyCode: e.keyCode
  });

  // Check if Ctrl+Alt + number key (1-9) is pressed
  if (e.key >= '1' && e.key <= '9') {
    if (e.ctrlKey && e.altKey) {
      // Prevent default behavior immediately
      e.preventDefault();
      console.log("Shortcut activated:", e.key);

      // Get the currently active persona for this tab
      chrome.storage.local.get(["personaTabs", "demo"], (result) => {

     
        const persona = result.personaTabs?.[currentTabId];
        
        console.log("Current persona:", persona);
        if (persona && persona.fakeText) {
          const index = parseInt(e.key) - 1;
          const text = persona.fakeText[index];
          console.log("Inserting text:", text);
          if (text) {
            // Get the currently focused element
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
              // For regular input/textarea elements
              if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                const start = activeElement.selectionStart;
                const end = activeElement.selectionEnd;
                const currentValue = activeElement.value;
                activeElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
                activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
              } 
              // For contenteditable elements
              else {
                document.execCommand('insertText', false, text);
              }
              e.preventDefault();
            }
          }
        }
      });
    }
  }
});

// Handle reload/navigation
window.addEventListener('load', async () => {
  console.log("Page loaded, checking for stored persona");
  await checkStoredPersona(currentTabId);
});