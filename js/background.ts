// background.ts

import ExtPay from 'extpay';
import { AuthService } from './auth';
import { ExtensionMessage, DemoFlowTemplate } from './types.js';

const extpay = ExtPay('abobjbfojjkoonmfffjppmkobmbcebdj'); // Careful! See note below
extpay.startBackground(); 

const authService = new AuthService();


// Keep service worker alive
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);

chrome.runtime.onStartup.addListener(keepAlive);
chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'keepAlive') {
        setTimeout(keepAlive, 295e3); // 5 minutes minus 5 seconds
    }
});

// Listening for messages
chrome.runtime.onMessage.addListener((request: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === "getTabId") {
    if (sender.tab && sender.tab.id) {
      sendResponse({ tabId: sender.tab.id });
    } else {
      sendResponse({ error: "No tab ID available" });
    }
    return true; // Required for async response
  }

  if (request.type === 'AUTH_SUCCESS') {
    // Broadcast authentication success to all extension views
    chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS' });
  }

  if (request.type === 'ZITADEL_AUTH_CODE') {
    authService.handleCallback(request.code!);
  }

  return true;
});

chrome.runtime.onMessage.addListener(async (message: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.type === 'ZITADEL_AUTH_CODE') {
        try {
            // First handle the auth callback
            await authService.handleCallback(message.code!);
            
            // Then close the auth window
            if (sender.tab) {
                await chrome.tabs.remove(sender.tab.id);
            }
            
            // Finally notify all extension views about success
            chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS' });
            
            // // Get the popup views
            // const views = chrome.extension.getViews({ type: 'popup' });
            // for (let view of views) {
            //     view.location.reload();
            // }
        } catch (error) {
            console.error('Auth handling failed:', error);
        }
        
    }
    if (message.type === 'EXTENSION_RUNDEMO') {
        console.log('RUNDEMO YEEEA', message.payload);

        const flowurl = chrome.runtime.getURL(`/demos/template1.json`);
            const response = await fetch(flowurl);
            const template: DemoFlowTemplate = await response.json();
            await chrome.storage.local.set({ pendingTemplate: template });
      
          // Create a new tab that will handle the template processing
          await chrome.tabs.create({
            url: chrome.runtime.getURL('html/processor.html'),
            active: true
          });
    }
    return true;
});

// On Page Refresh
chrome.tabs.onUpdated.addListener(tabUpdatedAction);
// Keyboard shortcuts (see Manifest.json)
chrome.commands.onCommand.addListener(keyboardAction);

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
   // if (details.reason === 'install') {
        // List of default pictures to bundle with the extension
        const defaultPictures = [
            'dwight.jpg',
            'id_clara.png','id_clark.png','id_daniel.png','id_patrick.png','id_thomas.png','id_vicky.png','kevin.jpg','mickael.jpg','pam.jpg'
            // Add more default pictures as needed
        ];

        // List of default logos to bundle with the extension
        const defaultLogos = [
            'testDunder-Mifflin.jpg',
            'testplanetexpress.png'
            // Add more default logos as needed
        ];

        // Load and store each default picture
        for (const pictureName of defaultPictures) {
            const response = await fetch(chrome.runtime.getURL(`pictures/${pictureName}`));
            const blob = await response.blob();
            const reader = new FileReader();
            
            reader.onloadend = async () => {
                await chrome.storage.local.set({
                    [`default_${pictureName}`]: reader.result
                });
            };
            
            reader.readAsDataURL(blob);
        }

        // Load and store each default logo
        for (const logoName of defaultLogos) {
            const response = await fetch(chrome.runtime.getURL(`logos/${logoName}`));
            const blob = await response.blob();
            const reader = new FileReader();
            
            reader.onloadend = async () => {
                const displayName = logoName.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
                await chrome.storage.local.set({
                    [`logo_default_${logoName}`]: reader.result,
                    [`logo_default_${logoName}_displayName`]: displayName
                });
            };
            
            reader.readAsDataURL(blob);
        }
   // }
});

function tabUpdatedAction(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
    if (changeInfo.status === 'complete') {
        // chrome.tabs.sendMessage(tabId, { message: 'hello!' }, function (response) {
        //     console.log(response);
        // });
    }
}

function keyboardAction(command: string, tab: chrome.tabs.Tab): void {
    chrome.tabs.sendMessage(tab.id!, { message: 'command triggered!' }, function (response) {

    });
};

/////////




