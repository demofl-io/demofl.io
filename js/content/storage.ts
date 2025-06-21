// js/content/storage.ts
import { createPersonaOverlay } from './overlay/index.js';
import { Persona } from '../types.js';

export function checkStoredPersona(currentTabId: number): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.get(["personaTabs"], (result) => {
        const personaTabs = result.personaTabs || {};
        if (currentTabId && personaTabs[currentTabId]) {
          console.log("Found persona for tab:", currentTabId);
          // Always create overlay on reload
          createPersonaOverlay(personaTabs[currentTabId] as Persona);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
}