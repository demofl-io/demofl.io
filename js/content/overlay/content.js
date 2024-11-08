import { getPersonaPicture } from '../../editor/components/persona.js';

export async function createOverlayContent(persona, theme) {
  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: none;
  `;

  let pictureUrl = null;
  if (persona.pictureurl) {
    const storedPicture = await getPersonaPicture(persona.pictureurl);
    if (storedPicture) {
      pictureUrl = storedPicture;
    }
  }

  content.innerHTML = `
    ${pictureUrl ? 
      `<img src="${pictureUrl}" alt="${persona.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">` : 
      `<div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${theme["overlay-color"]}20; display: flex; align-items: center; justify-content: center; color: ${theme["overlay-color"]};">
        ${persona.name.charAt(0)}
      </div>`
    }
    <div style="color: ${theme["overlay-color"]};">
      <div style="font-weight: bold; margin-bottom: 4px;">${persona.name}</div>
      <div style="font-size: 0.9em; opacity: 0.7;">${persona.title}</div>
    </div>
  `;

  return content;
}