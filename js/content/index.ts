// js/content/index.ts
import { init, currentTabId } from './init.js';
import { checkStoredPersona } from './storage.js';
import { createPersonaOverlay } from './overlay/index.js';
import { ExtensionMessage, StorageResult } from '../types.js';

console.log("Content script loaded on:", window.location.href);

// Start initialization and check for stored persona
async function initialize(): Promise<void> {
  await init();
  // checkStoredPersona is now called inside init() after currentTabId is set
}

initialize();

// Visibility change listener
document.addEventListener('visibilitychange', async (): Promise<void> => {
  if (document.visibilityState === 'hidden') {
    console.log("Tab becoming hidden");
  } else {
    console.log("Tab becoming visible, checking stored persona");
    await checkStoredPersona(currentTabId);
  }
});

// Message listener
chrome.runtime.onMessage.addListener((request: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === "showPersona") {
    chrome.storage.local.get(["personaTabs"], (result: StorageResult) => {
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
document.addEventListener('keydown', async (e: KeyboardEvent): Promise<void> => {
  // Check if Ctrl+Alt + number key (1-9) is pressed
  if (e.key >= '1' && e.key <= '9') {
    if (e.ctrlKey && e.altKey) {
      // Prevent default behavior immediately
      e.preventDefault();
      console.log("Shortcut activated:", e.key);

      // Get the currently active persona for this tab
      chrome.storage.local.get(["personaTabs", "demo"], (result: StorageResult) => {
        const persona = result.personaTabs?.[currentTabId];
        if (persona && persona.fakeText) {
          const index = parseInt(e.key) - 1;
          const text = persona.fakeText[index];
          console.log("Inserting text:", text);
          if (text) {
            // Get the currently focused element
            const activeElement = document.activeElement as HTMLElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
              // For regular input/textarea elements
              if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                const inputElement = activeElement as HTMLInputElement | HTMLTextAreaElement;
                const start = inputElement.selectionStart || 0;
                const end = inputElement.selectionEnd || 0;
                const currentValue = inputElement.value;
                inputElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
                inputElement.selectionStart = inputElement.selectionEnd = start + text.length;
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
window.addEventListener('load', async (): Promise<void> => {
  await checkStoredPersona(currentTabId);
});