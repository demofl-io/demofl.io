// js/popup/templates.js
export const demoFolder = "demos";

export async function loadBuiltInTemplates() {
  try {
    const response = await fetch(chrome.runtime.getURL(`/${demoFolder}/template1.json`));
    const template = await response.json();
    return [{ name: 'template1', data: template }];
  } catch (error) {
    console.error('Error loading built-in templates:', error);
    return [];
  }
}

// js/popup/templates.js
export async function saveTemplate(template, name, type) {
  try {
      if (type === 'user') {
          const result = await chrome.storage.local.get('userTemplates');
          const userTemplates = result.userTemplates || {};
          userTemplates[name] = template;
          await chrome.storage.local.set({ userTemplates });
      } else {
          // For built-in templates, save to userTemplates to allow editing
          const result = await chrome.storage.local.get('userTemplates');
          const userTemplates = result.userTemplates || {};
          userTemplates[name] = template;
          await chrome.storage.local.set({ userTemplates });
      }
      return true;
  } catch (error) {
      console.error('Error saving template:', error);
      return false;
  }
}