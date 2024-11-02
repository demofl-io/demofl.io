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

export async function saveTemplate(templateData, templateName) {
  try {
    const result = await chrome.storage.local.get('userTemplates');
    const userTemplates = result.userTemplates || {};
    userTemplates[templateName] = templateData;
    await chrome.storage.local.set({ userTemplates });
    return true;
  } catch (error) {
    console.error('Error saving template:', error);
    return false;
  }
}