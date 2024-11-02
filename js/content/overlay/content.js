// js/content/overlay/content.js
export function createOverlayContent(persona, theme) {
  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: none;
  `;

    // Get full URL for picture from extension resources
    const pictureUrl = persona.pictureurl ? 
    chrome.runtime.getURL(`pictures/${persona.pictureurl}`) : null;

  content.innerHTML = `
    ${pictureUrl ? 
      `<img src="${pictureUrl}" alt="${persona.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">` : 
      `<div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${theme.color}20; display: flex; align-items: center; justify-content: center; color: ${theme.color};">
        ${persona.name.charAt(0)}
      </div>`
    }
    <div style="color: ${theme.color};">
      <div style="font-weight: bold; margin-bottom: 4px;">${persona.name}</div>
      <div style="font-size: 0.9em; opacity: 0.7;">${persona.title}</div>
    </div>
  `;

  return content;
}