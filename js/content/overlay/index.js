// js/content/overlay/index.js
import { generateOverlayStyles } from './styles.js';
import { createOverlayContent } from './content.js';
import { createCloseButton } from './buttons.js';
import { initializeDrag } from './drag.js';

export async function createPersonaOverlay(persona) {
  try {
    const theme = await new Promise(resolve => {
      chrome.storage.local.get(["demo"], (result) => {
        resolve(result.demo?.theme || {
          "overlay-color": "#333333",
          "overlay-h": "right",
          "overlay-v": "top"
        });
      });
    });

    const existingOverlay = document.querySelector('.persona-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'persona-overlay';
    overlay.style.cssText = generateOverlayStyles(theme, theme["overlay-h"], theme["overlay-v"]);

    const content = await createOverlayContent(persona, theme);
    overlay.appendChild(content);

    const closeButton = createCloseButton(theme, () => {
      overlay.style.display = 'none';
    });
    overlay.appendChild(closeButton);

    document.body.appendChild(overlay);
    initializeDrag(overlay, theme);
  } catch (error) {
    console.error("Error creating overlay:", error);
  }
}