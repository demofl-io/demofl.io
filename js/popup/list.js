import { loadBuiltInTemplates } from './templates.js';

export async function clearTabs() {
  // First check and close any existing demo tabs
  console.log("clearing existing tabs");
  const result = await chrome.storage.local.get('demoTabIds');
  
  if (result.demoTabIds && result.demoTabIds.length > 0) {
    console.log("Clearing existing tabs:", result.demoTabIds);
    try {
      await chrome.tabs.remove(result.demoTabIds);
    } catch (e) {
      console.log("Some tabs were already closed:", e);
    }
    // Clear the stored tab IDs
    await chrome.storage.local.remove('demoTabIds');
  } else {
    console.log("No existing tabs to clear");
  }
}

export function createDemoFlowItem(type, name) {
  const demoFolder = 'demos';
  const item = document.createElement('div');
  item.className = 'flex items-center gap-2';

  // Main clickable area for running demo
  const mainArea = document.createElement('div');
  mainArea.className = 'flex-1 flex items-center p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700';
  mainArea.innerHTML = `
    <span class="text-lg mr-2">${type === 'builtin' ? '📚' : '📝'}</span>
    <span class="font-medium">${name}</span>
  `;
  
  // Add click handler for running demo
  mainArea.onclick = async () => {
    await clearTabs();

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

    await chrome.tabs.create({
      url: chrome.runtime.getURL('html/processor.html'),
      active: true
    });
  };

  // Action buttons container
  const actions = document.createElement('div');
  actions.className = 'flex gap-1';

  // Export button
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn btn-sm bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded';
  exportBtn.innerHTML = '⬇';
  exportBtn.title = 'Export Demo Flow';
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

  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn btn-sm bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded';
  copyBtn.innerHTML = '📋';
  copyBtn.title = 'Copy Demo Flow';
  copyBtn.onclick = async () => {
    let newName = window.prompt("Enter a name for the copied demo flow:", `${name}-copy`);
    
    if (!newName) {
      alert("Demo flow name is required!");
      return;
    }
    
    newName = newName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    const result = await chrome.storage.local.get('userTemplates');
    const userTemplates = result.userTemplates || {};
    
    if (userTemplates[newName]) {
      alert("A demo flow with this name already exists!");
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

  // Edit and Delete buttons for user demos
  if (type === 'user') {
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit Demo Flow';
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

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm bg-red-800 hover:bg-red-700 px-2 py-1 rounded';
    deleteBtn.innerHTML = '🗑';
    deleteBtn.title = 'Delete Demo Flow';
    deleteBtn.onclick = async () => {
      if (confirm(`Delete demo flow "${name}"?`)) {
        const result = await chrome.storage.local.get('userTemplates');
        const userTemplates = result.userTemplates || {};
        delete userTemplates[name];
        await chrome.storage.local.set({ userTemplates });
        await loadDemoList();
      }
    };
    actions.appendChild(deleteBtn);
  }

  item.appendChild(mainArea);
  item.appendChild(actions);
  return item;
}

export async function loadDemoList() {
  const container = document.getElementById("templateList");
  container.innerHTML = '';

  // Top header with action buttons
  const headerDiv = document.createElement('div');
  headerDiv.className = 'flex items-center justify-between mb-4';

  // Left side - title
  const titleDiv = document.createElement('div');
  titleDiv.className = 'text-lg font-medium';
  titleDiv.textContent = 'Demo Flows';

  // Right side - action buttons
  const actionButtons = document.createElement('div');
  actionButtons.className = 'flex gap-2';

  // Import button
  const importBtn = document.createElement('button');
  importBtn.className = 'p-1.5 rounded bg-gray-700 hover:bg-gray-600';
  importBtn.innerHTML = '📥';
  importBtn.title = 'Import Demo Flow';
  importBtn.id = 'importTemplate'; // Add ID to work with existing import.js

  // Manage button
  const manageBtn = document.createElement('button');
  manageBtn.className = 'p-1.5 rounded bg-gray-700 hover:bg-gray-600';
  manageBtn.innerHTML = '⚙️';
  manageBtn.title = 'Manage Demo Flows';
  manageBtn.id = 'configLogos'; // Add ID to work with existing index.js

  actionButtons.appendChild(importBtn);
  actionButtons.appendChild(manageBtn);
  
  headerDiv.appendChild(titleDiv);
  headerDiv.appendChild(actionButtons);
  container.appendChild(headerDiv);

  // Create New and Clear tabs buttons
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'flex items-center justify-between gap-2 mb-4';

  // New demo flow button
  const newDemoFlowDiv = document.createElement('div');
  newDemoFlowDiv.className = 'flex-1 flex items-center justify-between p-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600';
  newDemoFlowDiv.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-lg">✨</span>
      <span class="font-medium">Create New Demo Flow</span>
    </div>
  `;
  newDemoFlowDiv.onclick = async () => {
    // Prompt for template name
    let templateName = window.prompt("Enter a name for your new demo flow:", "");
    
    // Validate name
    if (!templateName) {
        alert("Demo flow name is required!");
        return;
    }
    
    // Remove spaces and special characters
    templateName = templateName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Check if name already exists
    const result = await chrome.storage.local.get('userTemplates');
    const userTemplates = result.userTemplates || {};
    
    if (userTemplates[templateName]) {
        alert("A demo flow with this name already exists!");
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

  // Clear tabs button
  const clearTabsDiv = document.createElement('div');
  clearTabsDiv.className = 'flex-1 flex items-center justify-between p-2 bg-red-900 rounded-lg cursor-pointer hover:bg-red-800';
  clearTabsDiv.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-lg">🧹</span>
      <span class="font-medium">Clear Demo Tabs</span>
    </div>
  `;
  clearTabsDiv.onclick = clearTabs;

  controlsDiv.appendChild(newDemoFlowDiv);
  controlsDiv.appendChild(clearTabsDiv);
  container.appendChild(controlsDiv);

  // Load existing templates
  const builtinTemplates = await loadBuiltInTemplates();
  const result = await chrome.storage.local.get('userTemplates');
  const userTemplates = result.userTemplates || {};

  for (const template of builtinTemplates) {
    container.appendChild(createDemoFlowItem('builtin', template.name));
  }

  for (const [name, _] of Object.entries(userTemplates)) {
    container.appendChild(createDemoFlowItem('user', name));
  }
}