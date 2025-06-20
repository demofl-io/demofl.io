import { demoFolder } from './templates.js';
import { generateOverviewHTML, generatePersonasHTML } from './templates/index.js';
import { DemoFlowTemplate, StorageResult } from '../types.js';

export async function openJSONFile(value: string): Promise<void> {
    const [type, name] = value.split(':');

    if (type === 'builtin') {
        const flowurl = chrome.runtime.getURL(`/${demoFolder}/${name}.json`);
        const response = await fetch(flowurl);
        const data: DemoFlowTemplate = await response.json();
        await parseDemoFile(data);
    } else {
        const result: StorageResult = await chrome.storage.local.get('userTemplates');
        const template: DemoFlowTemplate = result.userTemplates[name];
        await parseDemoFile(template);
    }
}

export async function parseDemoFile(demoData: DemoFlowTemplate): Promise<void> {
    try {
        const currentWindow = await chrome.windows.getCurrent();
        let currentWindowId = currentWindow.id;
        let demoTabIds = []; // Track all created tab IDs

        // Save demo data to storage first
        await saveDemoToLocalStorage(demoData);

        // Create overview page first

        const overviewTab = await chrome.tabs.create({
            active: true,
            url: chrome.runtime.getURL('html/overview.html'),
            windowId: currentWindowId
        });
        demoTabIds.push(overviewTab.id);

        // Create personas page
        const personasTab = await chrome.tabs.create({
            active: false,
            url: chrome.runtime.getURL('html/personas.html'),
            windowId: currentWindowId
        });
        demoTabIds.push(personasTab.id);


        // Process each step
        for (let i = 0; i < demoData.steps.length; i++) {
            let stepTabIds = [];
            let stepWindowId = currentWindowId;

            if (demoData.steps[i].incognito && demoData.steps[i].urls.length > 0) {
                const windownew = await chrome.windows.create({ incognito: true });
                stepWindowId = windownew.id;
            }

                                // Create overview page at the end also

        const overviewTabstart = await chrome.tabs.create({
            active: true,
            url: chrome.runtime.getURL('html/overview.html'+`?step=${i}`),
            windowId: currentWindowId
        });
        stepTabIds.push(overviewTabstart.id);
        demoTabIds.push(overviewTabstart.id);

            // Create tabs for this step
            for (let j = 0; j < demoData.steps[i].urls.length; j++) {
                const tab = await chrome.tabs.create({
                    active: false,
                    url: demoData.steps[i].urls[j],
                    windowId: stepWindowId
                });

                stepTabIds.push(tab.id);
                demoTabIds.push(tab.id);

                if (demoData.steps[i].persona) {
                    await new Promise((resolve) => {
                        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                            if (tabId === tab.id && info.status === 'complete') {
                                chrome.tabs.onUpdated.removeListener(listener);
                                const personaData = demoData.personas[demoData.steps[i].persona];

                                chrome.storage.local.get(['personaTabs'], (result) => {
                                    const personaTabs = result.personaTabs || {};
                                    personaTabs[tab.id] = {
                                        ...personaData,
                                        theme: demoData.theme
                                    };
                                    chrome.storage.local.set({ personaTabs }, () => {
                                        chrome.tabs.sendMessage(tab.id, {
                                            action: "showPersona",
                                            persona: personaData
                                        });
                                        resolve(undefined);
                                    });
                                });
                            }
                        });
                    });
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




            // Group tabs
            if (stepTabIds.length > 0) {
                const group = await chrome.tabs.group({
                    tabIds: stepTabIds,
                    createProperties: { windowId: stepWindowId }
                });
                
                const validColors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'] as const;
                const tabColor = demoData.steps[i].tabColor;
                
                await chrome.tabGroups.update(group, { 
                    title: demoData.steps[i].title,
                    color: validColors.includes(tabColor as any) ? tabColor as any : 'green'
                });
            }
        }

                            // Create overview page at the end also

                            const overviewTabend = await chrome.tabs.create({
                                active: true,
                                url: chrome.runtime.getURL('html/overview.html'),
                                windowId: currentWindowId
                            });
                            demoTabIds.push(overviewTabend.id);
        // Store the tab IDs
        await chrome.storage.local.set({"demoTabIds" : demoTabIds });

        // Focus on the first created tab (overview)
        await chrome.tabs.update(demoTabIds[0], { active: true });
        await chrome.windows.update(currentWindowId, { focused: true });

    } catch (error) {
        console.error("Error in parseDemoFile:", error);
        throw error;
    }
}

export async function saveDemoToLocalStorage(demoData) {
    await chrome.storage.local.set({ demo: demoData });
}