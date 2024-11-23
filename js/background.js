// background.js

import ExtPay from 'extpay';
import { AuthService } from './auth';

var extpay = ExtPay('abobjbfojjkoonmfffjppmkobmbcebdj'); // Careful! See note below
extpay.startBackground(); 

const authService = new AuthService();

chrome.runtime.onStartup.addListener( () => {
    console.log(`onStartup()`);
});

// Listening for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
    authService.handleCallback(request.code);
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ZITADEL_AUTH_CODE') {
        // Close the auth window using the sender tab
        if (sender.tab) {
            chrome.tabs.remove(sender.tab.id);
        }
        
        // Notify the popup about successful authentication
        chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS' });
    }
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

function receiverAction(request, sender, sendResponse) {
    console.log(sender.tab.id + " = " + request);
    console.log(sender.tab.url + " = " + request.message);
    if (request.action === "getTabId") {
        sendResponse({ tabId: sender.tab.id });
        return true;
      }
}

function tabUpdatedAction(tabId, changeInfo, tab) {
    console.log(`updatedAction`);
    if (changeInfo.status === 'complete') {
        // chrome.tabs.sendMessage(tabId, { message: 'hello!' }, function (response) {
        //     console.log(response);
        // });
    }
}

function keyboardAction(command, tab) {
    console.log("listencommand....");
    console.log(`Command "${command}" triggered`);
    chrome.tabs.sendMessage(tab.id, { message: 'command triggered!' }, function (response) {

    });
};

/////////




