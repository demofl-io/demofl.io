// js/content/overlay/content.ts
import { getPersonaPicture } from '../../editor/components/persona.js';
import { Persona, Theme } from '../../types.js';

export async function createOverlayContent(persona: Persona, theme: Theme): Promise<HTMLElement> {
  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: none;
  `;

  // Handle case where persona is undefined or null
  if (!persona) {
    console.error("Persona is undefined or null");
    content.innerHTML = `
      <div style="color: ${theme["overlay-color"] || "#333"};">
        <div style="font-weight: bold;">Error: No persona data</div>
      </div>
    `;
    return content;
  }

  let pictureUrl = null;
  if (persona.pictureurl) {
    const storedPicture = await getPersonaPicture(persona.pictureurl);
    if (storedPicture) {
      pictureUrl = storedPicture;
    }
  }

  // Use fallback values if properties are missing
  const personaName = persona.name || 'Unknown';
  const personaTitle = persona.title || '';

  content.innerHTML = `
    ${pictureUrl ? 
      `<img src="${pictureUrl}" alt="${personaName}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">` : 
      `<div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${theme["overlay-color"]}20; display: flex; align-items: center; justify-content: center; color: ${theme["overlay-color"]};">
        ${personaName.charAt(0)}
      </div>`
    }
    <div style="color: ${theme["overlay-color"]};">
      <div style="font-weight: bold; margin-bottom: 4px;">${personaName}</div>
      <div style="font-size: 0.9em; opacity: 0.7;">${personaTitle}</div>
    </div>
  `;

  return content;
}