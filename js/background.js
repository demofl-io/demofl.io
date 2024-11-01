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
});

// On Page Refresh
chrome.tabs.onUpdated.addListener(tabUpdatedAction);
// Keyboard shortcuts (see Manifest.json)
chrome.commands.onCommand.addListener(keyboardAction);

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




