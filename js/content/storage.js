// js/content/storage.js
import { createPersonaOverlay } from './overlay/index.js';

export function checkStoredPersona(currentTabId) {
    return new Promise((resolve) => {
      chrome.storage.local.get(["personaTabs"], (result) => {
        const personaTabs = result.personaTabs || {};
        if (currentTabId && personaTabs[currentTabId]) {
          console.log("Found persona for tab:", currentTabId);
          // Always create overlay on reload
          createPersonaOverlay(personaTabs[currentTabId]);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
}