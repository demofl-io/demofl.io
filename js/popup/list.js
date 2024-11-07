// js/popup/list.js
import { loadBuiltInTemplates } from './templates.js';
import { openJSONFile } from './parser.js';
import { saveTemplate } from './templates.js'; // Ensure this is imported

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
  runBtn.className = 'btn btn-sm btn-primary'; // Blue - Primary action
  runBtn.innerHTML = '▶';
  runBtn.title = 'Run Template';
  runBtn.onclick = async () => {
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
      url: chrome.runtime.getURL('html/processor.html'),
      active: true
    });
  };
  actions.appendChild(runBtn);

  // Export button
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn btn-sm btn-secondary'; // Gray - Secondary action
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
  actions.appendChild(exportBtn);

  // Add Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-sm btn-primary'; // Blue - Primary action
  editBtn.innerHTML = '✏️';
  editBtn.title = 'Edit Template';
  editBtn.onclick = async () => {
    let template;
    if (type === 'user') {
      const result = await chrome.storage.local.get('userTemplates');
      template = result.userTemplates[name];
    } else {
      const flowurl = chrome.runtime.getURL(`/${demoFolder}/${name}.json`);
      const response = await fetch(flowurl);
      template = await response.json();
    }

    // Store the template info in local storage for editing
    await chrome.storage.local.set({ editingTemplate: { name, data: template, type } });

    // Open the editor page
    await chrome.tabs.create({
      url: chrome.runtime.getURL('html/editor.html'),
      active: true
    });
  };
  actions.appendChild(editBtn);

  // Add copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn btn-sm btn-primary'; // Blue - Primary action
  copyBtn.innerHTML = '📋';
  copyBtn.title = 'Copy Template';
  copyBtn.onclick = async () => {
    let newName = window.prompt("Enter a name for the copied template:", `${name}-copy`);
    
    if (!newName) {
      alert("Template name is required!");
      return;
    }
    
    newName = newName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    const result = await chrome.storage.local.get('userTemplates');
    const userTemplates = result.userTemplates || {};
    
    if (userTemplates[newName]) {
      alert("A template with this name already exists!");
      return;
    }

    // Get source template data
    let templateData;
    if (type === 'user') {
      templateData = userTemplates[name];
    } else {
      const flowurl = chrome.runtime.getURL(`/${demoFolder}/${name}.json`);
      const response = await fetch(flowurl);
      templateData = await response.json();
    }

    // Store copied template for editing
    await chrome.storage.local.set({ 
      editingTemplate: { 
        name: newName,
        data: templateData,
        type: 'user'
      } 
    });

    await chrome.tabs.create({
      url: chrome.runtime.getURL('html/editor.html'),
      active: true
    });
  };
  actions.appendChild(copyBtn);

  // Add Delete button for user templates
  if (type === 'user') {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-error'; // Red - Destructive action
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

  // Add "New Template" button at the top
  const newTemplateDiv = document.createElement('div');
  newTemplateDiv.className = 'flex items-center justify-between p-2 bg-gray-700 rounded-lg mb-4';
  
  const newTemplateInfo = document.createElement('div');
  newTemplateInfo.className = 'flex items-center gap-2';
  newTemplateInfo.innerHTML = `
    <span class="text-lg">✨</span>
    <span class="font-medium">Create New Template</span>
  `;

  const createBtn = document.createElement('button');
  createBtn.className = 'btn btn-sm btn-primary'; // Blue - Primary action
  createBtn.innerHTML = '🆕';
  createBtn.title = 'Create New Template';
  createBtn.onclick = async () => {
    // Prompt for template name
    let templateName = window.prompt("Enter a name for your new template:", "");
    
    // Validate name
    if (!templateName) {
        alert("Template name is required!");
        return;
    }
    
    // Remove spaces and special characters
    templateName = templateName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Check if name already exists
    const result = await chrome.storage.local.get('userTemplates');
    const userTemplates = result.userTemplates || {};
    
    if (userTemplates[templateName]) {
        alert("A template with this name already exists!");
        return;
    }

    const emptyTemplate = {
        theme: {
            'brand-color': '#000000',
            'brand-font': 'Arial',
            'overlay-color': '#ffffff',
            'overlay-background': '#111827',
            'overlay-h': 'center',
            'overlay-v': 'top',
            'overlay-scale': '100%'
        },
        product: {
            name: '',
            logourl: ''
        },
        customer: {
            name: '',
            logourl: ''
        },
        personas: {},
        steps: []
    };

    // Store with user-provided name
    await chrome.storage.local.set({ 
        editingTemplate: { 
            name: templateName,
            data: emptyTemplate, 
            type: 'user' 
        } 
    });

    await chrome.tabs.create({
        url: chrome.runtime.getURL('html/editor.html'),
        active: true
    });
  };

  newTemplateDiv.appendChild(newTemplateInfo);
  newTemplateDiv.appendChild(createBtn);
  container.appendChild(newTemplateDiv);

  // Load existing templates
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