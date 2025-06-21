// js/popup/import.ts
import { saveTemplate } from './templates.js';
import { loadDemoList } from './list.js';
import { DemoFlowTemplate } from '../types.js';

export function initializeImport(): void {
  const importButton = document.getElementById('importTemplate');
  const fileInput = document.getElementById('templateFileInput') as HTMLInputElement;

  if (importButton && fileInput) {
    importButton.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const template: DemoFlowTemplate = JSON.parse(text);
        const templateName = file.name.replace('.json', '');
        
        await saveTemplate(template, templateName, 'user');
        await loadDemoList();
      } catch (error) {
        console.error('Error importing template:', error);
      }
    });


    document.getElementById('configLogos').addEventListener('click', () => {
      chrome.tabs.create({
          url: chrome.runtime.getURL('html/config.html')
      });
  });
  }
}