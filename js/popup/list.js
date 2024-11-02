// js/popup/list.js
import { loadBuiltInTemplates } from './templates.js';
import { openJSONFile } from './parser.js';

export function createTemplateItem(type, name) {
  const demoFolder = 'demos';
  const item = document.createElement('div');
  item.className = 'flex items-center justify-between p-2 bg-gray-800 rounded-lg';

  // Template info
  const info = document.createElement('div');
  info.className = 'flex items-center gap-2';
  info.innerHTML = `
      <span class="text-lg">${type === 'builtin' ? '📚' : '📝'}</span>
      <span class="font-medium">${name}</span>
    `;

  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'flex gap-2';

  // Run button
  const runBtn = document.createElement('button');
  runBtn.className = 'btn btn-sm btn-primary';
  runBtn.innerHTML = '▶';
  runBtn.title = 'Run Template';
  runBtn.onclick = async () => {
    // Store the template info in local storage first
    if (type === 'user') {
      const result = await chrome.storage.local.get('userTemplates');
      const template = result.userTemplates[name];
      await chrome.storage.local.set({ pendingTemplate: template });
    } else {
      const flowurl = chrome.runtime.getURL(`/${demoFolder}/${name}.json`);
      const response = await fetch(flowurl);
      const template = await response.json();
      await chrome.storage.local.set({ pendingTemplate: template });
    }

    // Create a new tab that will handle the template processing
    await chrome.tabs.create({
      url: chrome.runtime.getURL('processor.html'),
      active: true
    });
  };

  // Export button
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn btn-sm btn-secondary';
  exportBtn.innerHTML = '⬇';
  exportBtn.title = 'Export Template';
  exportBtn.onclick = async () => {
    let template;
    if (type === 'user') {
      const result = await chrome.storage.local.get('userTemplates');
      template = result.userTemplates[name];
    } else {
      const flowurl = chrome.runtime.getURL(`/${demoFolder}/${name}.json`);
      const response = await fetch(flowurl);
      template = await response.json();
    }

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  actions.appendChild(runBtn);
  actions.appendChild(exportBtn);

  // Add delete button for user templates
  if (type === 'user') {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-error';
    deleteBtn.innerHTML = '🗑';
    deleteBtn.title = 'Delete Template';
    deleteBtn.onclick = async () => {
      if (confirm(`Delete template "${name}"?`)) {
        const result = await chrome.storage.local.get('userTemplates');
        const userTemplates = result.userTemplates || {};
        delete userTemplates[name];
        await chrome.storage.local.set({ userTemplates });
        await loadDemoList();
      }
    };
    actions.appendChild(deleteBtn);
  }

  item.appendChild(info);
  item.appendChild(actions);
  return item;
}

export async function loadDemoList() {
  const container = document.getElementById("templateList");
  container.innerHTML = '';

  const builtinTemplates = await loadBuiltInTemplates();
  const result = await chrome.storage.local.get('userTemplates');
  const userTemplates = result.userTemplates || {};

  for (const template of builtinTemplates) {
    container.appendChild(createTemplateItem('builtin', template.name));
  }

  for (const [name, _] of Object.entries(userTemplates)) {
    container.appendChild(createTemplateItem('user', name));
  }
}