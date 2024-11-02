import { demoFolder } from './templates.js';

export async function openJSONFile(value) {
  const [type, name] = value.split(':');
  
  if (type === 'builtin') {
    const flowurl = chrome.runtime.getURL(`/${demoFolder}/${name}.json`);
    const response = await fetch(flowurl);
    const data = await response.json();
    await parseDemoFile(data);
  } else {
    const result = await chrome.storage.local.get('userTemplates');
    const template = result.userTemplates[name];
    await parseDemoFile(template);
  }
}

export async function parseDemoFile(demoData) {
    try {
        const currentWindow = await chrome.windows.getCurrent();
        let currentWindowId = currentWindow.id;
    
        for (let i = 0; i < demoData.steps.length; i++) {
          let stepTabIds = [];
          let stepWindowId = currentWindowId;
          
          if (demoData.steps[i].incognito && demoData.steps[i].urls.length > 0) {
            try {
              const windownew = await chrome.windows.create({ 
                incognito: true,
                focused: false
              });
              stepWindowId = windownew.id;
            } catch (error) {
              console.error("Error creating incognito window:", error);
              continue;
            }
          }
          
          // Create all tabs for this step
          for (let j = 0; j < demoData.steps[i].urls.length; j++) {
            try {
              const tab = await chrome.tabs.create({ 
                active: false, 
                url: demoData.steps[i].urls[j], 
                windowId: stepWindowId 
              });
              
              stepTabIds.push(tab.id);
    
              if (demoData.steps[i].personna) {
                await new Promise((resolve) => {
                  chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                    if (tabId === tab.id && info.status === 'complete') {
                      chrome.tabs.onUpdated.removeListener(listener);
                      const personaData = demoData.personnas[demoData.steps[i].personna];
                      chrome.tabs.sendMessage(tab.id, {
                        action: "showPersona",
                        persona: personaData
                      }, (response) => {
                        if (chrome.runtime.lastError) {
                          console.error('Error:', chrome.runtime.lastError);
                        }
                        resolve();
                      });
                    }
                  });
                });
              }
            } catch (error) {
              console.error("Error creating tab:", error);
            }
          }
    
          // Close the first tab in incognito window if needed
          if (demoData.steps[i].incognito && demoData.steps[i].urls.length > 0) {
            try {
              const tabs = await chrome.tabs.query({ windowId: stepWindowId });
              await chrome.tabs.remove(tabs[0].id);
            } catch (error) {
              console.error("Error closing initial incognito tab:", error);
            }
          }
    
          // Update the demo data with the new tab ids
          demoData.steps[i].tabIds = stepTabIds;
    
          // Group tabs if there are any
          if (stepTabIds.length > 0) {
            try {
              const group = await chrome.tabs.group({ 
                tabIds: stepTabIds, 
                createProperties: { windowId: stepWindowId } 
              });
              await chrome.tabGroups.update(group, { 
                title: demoData.steps[i].title 
              });
            } catch (error) {
              console.error("Error grouping tabs:", error);
            }
          }
        }
    
        // Save the demo data to local storage
        await saveDemoToLocalStorage(demoData);
        
      } catch (error) {
        console.error("Error in parseDemoFile:", error);
        throw error;
      }
}

export async function saveDemoToLocalStorage(demoData) {
  console.log(demoData);
  await chrome.storage.local.set({ demo: demoData });
}