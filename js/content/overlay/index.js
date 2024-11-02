// js/content/overlay/index.js
import { generateOverlayStyles } from './styles.js';
import { createOverlayContent } from './content.js';
import { createCloseButton } from './buttons.js';
import { initializeDrag } from './drag.js';

export function createPersonaOverlay(persona) {
  try {
    chrome.storage.local.get(["demo"], (result) => {
      const theme = result.demo.theme;
      
      const existingOverlay = document.querySelector('.persona-overlay');
      if (existingOverlay) {
        console.log("Overlay already exists, skipping creation");
        return;
      }

      const overlay = document.createElement('div');
      overlay.className = 'persona-overlay';
      overlay.style.cssText = generateOverlayStyles(theme, theme["overlay-h"], theme["overlay-v"]);

      const content = createOverlayContent(persona, theme);
      overlay.appendChild(content);

      const closeButton = createCloseButton(theme, () => {
        overlay.style.display = 'none';
      });
      overlay.appendChild(closeButton);

      document.body.appendChild(overlay);
      initializeDrag(overlay, theme);
    });
  } catch (error) {
    console.error("Error creating overlay:", error);
  }
}