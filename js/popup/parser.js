import { demoFolder } from './templates.js';
import { generateOverviewHTML, generatePersonasHTML } from './overview.js';

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

        // Save demo data to storage first
        await saveDemoToLocalStorage(demoData);

        // Create overview page first
        const overviewHTML = generateOverviewHTML(demoData);
        const overviewBlob = new Blob([overviewHTML], { type: 'text/html' });
        const overviewUrl = URL.createObjectURL(overviewBlob);

        await chrome.tabs.create({
            active: true,
            url: overviewUrl,
            windowId: currentWindowId
        });

        // Create personas page
        const personasHTML = generatePersonasHTML(demoData);
        const personasBlob = new Blob([personasHTML], { type: 'text/html' });
        const personasUrl = URL.createObjectURL(personasBlob);

        await chrome.tabs.create({
            active: false,
            url: personasUrl,
            windowId: currentWindowId
        });

        // Process each step
        for (let i = 0; i < demoData.steps.length; i++) {
            let stepTabIds = [];
            let stepWindowId = currentWindowId;

            if (demoData.steps[i].incognito && demoData.steps[i].urls.length > 0) {
                const windownew = await chrome.windows.create({ incognito: true });
                stepWindowId = windownew.id;
            }

            // Create tabs for this step
            for (let j = 0; j < demoData.steps[i].urls.length; j++) {
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
                                        resolve();
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
                await chrome.tabGroups.update(group, { title: demoData.steps[i].title });
            }
        }
    } catch (error) {
        console.error("Error in parseDemoFile:", error);
        throw error;
    }
}

export async function saveDemoToLocalStorage(demoData) {
    console.log(demoData);
    await chrome.storage.local.set({ demo: demoData });
}