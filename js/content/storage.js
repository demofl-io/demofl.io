// js/content/storage.js
import { createPersonaOverlay } from './overlay/index.js';

export function checkStoredPersona(currentTabId) {
    console.log("Checking stored persona for tab:", currentTabId);
    return new Promise((resolve) => {
      chrome.storage.local.get(["personaTabs"], (result) => {
        console.log("Storage state:", result);
        const personaTabs = result.personaTabs || {};
        if (currentTabId && personaTabs[currentTabId]) {
          console.log("Found persona for tab:", currentTabId);
          // Always create overlay on reload
          createPersonaOverlay(personaTabs[currentTabId]);
          resolve(true);
        } else {
          console.log("No persona found for tab:", currentTabId);
          resolve(false);
        }
      });
    });
}