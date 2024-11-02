// js/popup/import.js
import { saveTemplate } from './templates.js';
import { loadDemoList } from './list.js';

export function initializeImport() {
  const importButton = document.getElementById('importTemplate');
  const fileInput = document.getElementById('templateFileInput');

  if (importButton && fileInput) {
    importButton.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const template = JSON.parse(text);
        const templateName = file.name.replace('.json', '');
        
        await saveTemplate(template, templateName);
        await loadDemoList();
      } catch (error) {
        console.error('Error importing template:', error);
      }
    });
  }
}