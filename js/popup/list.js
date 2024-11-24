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
  runBtn.className = 'btn btn-sm bg-gray-800';
  runBtn.innerHTML = '▶';
  runBtn.title = 'Run Demo Flow';
  runBtn.onclick = async () => {
    // First check and close any existing demo tabs
    clearTabs();

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
  exportBtn.className = 'btn btn-sm bg-gray-800';
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

  // Add copy button - available for all templates
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn btn-sm bg-gray-800';
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

  // Add Edit button - only for user demo flows
  if (type === 'user') {
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm bg-gray-800';
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

    // Add Delete button for user demo flows
    if (type === 'user') {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm bg-red-800 hover:bg-red-700';
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
  }

  item.appendChild(info);
  item.appendChild(actions);
  return item;
}

export async function loadDemoList() {
  const container = document.getElementById("templateList");
  container.innerHTML = '';

  // Add buttons at the top
  const topDiv = document.createElement('div');
  topDiv.className = 'flex items-center justify-between gap-2 mb-4';

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

  topDiv.appendChild(newDemoFlowDiv);
  topDiv.appendChild(clearTabsDiv);
  container.appendChild(topDiv);

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