// js/content/port.js
export let port;

export function connectToBackground() {
    try {
        if (port) {
          port.disconnect();
        }
        
        port = chrome.runtime.connect({ name: "persona-port" });
        console.log("Connected to background script");
        
        // Add cleanup listener here, where we know port exists
        port.onDisconnect.addListener(() => {
          console.log("Port disconnected");
          port = null;
          
          // Only clean up if we're actually closing the tab
          if (document.visibilityState === 'hidden') {
            window.addEventListener('unload', () => {
              if (currentTabId) {
                chrome.storage.local.get(["personaTabs"], (result) => {
                  const personaTabs = result.personaTabs || {};
                  delete personaTabs[currentTabId];
                  chrome.storage.local.set({ personaTabs });
                });
              }
            });
          }
        });
        
        return true;
      } catch (error) {
        console.error("Connection error:", error);
        return false;
      }
}