console.log("Content script loaded on:", window.location.href);

let currentTabId;
let port;

// Connect to background script with retry mechanism
function connectToBackground() {
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
            console.log("Cleaning up on tab close:", currentTabId);
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

// Move storage check into a function
function checkStoredPersona() {
  console.log("Checking stored persona for tab:", currentTabId);
  return new Promise((resolve) => {
    chrome.storage.local.get(["personaTabs"], (result) => {
      console.log("Storage state:", result);
      const personaTabs = result.personaTabs || {};
      if (currentTabId && personaTabs[currentTabId]) {
        console.log("Found persona for tab:", currentTabId);
        // Always create overlay on reload
        createPersonaOverlay(personaTabs[currentTabId]);
        resolve(true);
      } else {
        console.log("No persona found for tab:", currentTabId);
        resolve(false);
      }
    });
  });
}

// Initialize tab ID and connection with retry
function init() {
  chrome.runtime.sendMessage({ action: "getTabId" }, async (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error getting tab ID:", chrome.runtime.lastError);
      setTimeout(init, 1000);
      return;
    }
    
    if (response && response.tabId) {
      currentTabId = response.tabId;
      console.log("Tab ID set to:", currentTabId);
      
      // Connect to background first
      if (connectToBackground()) {
        // Always check for stored persona data
        await checkStoredPersona();
      }
    } else {
      console.error("No tab ID received");
      setTimeout(init, 1000);
    }
  });
}

// Start initialization
init();

// Add this after the init() call
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    console.log("Tab becoming hidden");
  } else {
    console.log("Tab becoming visible, checking stored persona");
    checkStoredPersona();
  }
});

// Function to create and show overlay
function createPersonaOverlay(persona) {
  console.log("Creating overlay for persona:", persona);
  try {
    // Get theme from storage
    chrome.storage.local.get(["demo"], (result) => {
      const theme = result.demo.theme;
      
      // Check if overlay already exists
      const existingOverlay = document.querySelector('.persona-overlay');
      if (existingOverlay) {
        console.log("Overlay already exists, skipping creation");
        return;
      }

      const overlay = document.createElement('div');
      overlay.className = 'persona-overlay';

      // Add animation keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          0% {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);

      // Update overlay styles to include theme
      overlay.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translate(-50%, 0);
        background-color: ${theme.background};
        color: ${theme.color};
        font-family: ${theme.font}, sans-serif;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        max-width: 300px;
        cursor: move;
        user-select: none;
        animation: slideIn 0.3s ease-out forwards;
        transition: transform 0.3s ease-out;
      `;

      // Rest of your overlay content with themed colors
      const content = document.createElement('div');
      content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        pointer-events: none;
      `;

      content.innerHTML = `
        ${persona.pictureurl ? 
          `<img src="${persona.pictureurl}" alt="${persona.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">` : 
          `<div style="width: 48px; height: 48px; border-radius: 50%; background-color: ${theme.color}20; display: flex; align-items: center; justify-content: center; color: ${theme.color};">
            ${persona.name.charAt(0)}
          </div>`
        }
        <div style="color: ${theme.color};">
          <div style="font-weight: bold; margin-bottom: 4px;">${persona.name}</div>
          <div style="font-size: 0.9em; opacity: 0.7;">${persona.title}</div>
        </div>
      `;

      overlay.appendChild(content);
      document.body.appendChild(overlay);

      // Add close button with themed colors
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${theme.background};
        color: ${theme.color};
        border: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        z-index: 10000;
      `;

      // Simple hide on click
      closeButton.addEventListener('click', () => {
        // Just hide the overlay visually
        overlay.style.display = 'none';
      });

      overlay.appendChild(closeButton);

      // Add drag functionality
      let isDragging = false;
      let currentX;
      let currentY;
      let initialX;
      let initialY;

      const dragStart = (e) => {
        if (e.target === overlay) {
          initialX = e.clientX - overlay.offsetLeft;
          initialY = e.clientY - overlay.offsetTop;
          isDragging = true;
        }
      };

      const dragEnd = () => {
        isDragging = false;
      };

      const drag = (e) => {
        if (isDragging) {
          e.preventDefault();
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;

          // Keep overlay within viewport bounds
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const overlayRect = overlay.getBoundingClientRect();

          currentX = Math.min(Math.max(0, currentX), viewportWidth - overlayRect.width);
          currentY = Math.min(Math.max(0, currentY), viewportHeight - overlayRect.height);

          overlay.style.left = `${currentX}px`;
          overlay.style.top = `${currentY}px`;
          overlay.style.transform = 'none';
        }
      };

      // Add event listeners for drag
      overlay.addEventListener('mousedown', dragStart, false);
      document.addEventListener('mousemove', drag, false);
      document.addEventListener('mouseup', dragEnd, false);

      // Add close button functionality
      closeButton.addEventListener('click', () => {
        overlay.remove();
        // if (currentTabId) {
        //   chrome.storage.local.get(["personaTabs"], (result) => {
        //     const personaTabs = result.personaTabs || {};
        //     delete personaTabs[currentTabId];
        //     chrome.storage.local.set({ personaTabs });
        //   });
        // }
      });

      overlay.appendChild(closeButton);
    });
  } catch (error) {
    console.error("Error creating overlay:", error);
  }
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showPersona") {
    console.log("Received showPersona message:", request.persona);
    
    chrome.storage.local.get(["personaTabs"], (result) => {
      const personaTabs = result.personaTabs || {};
      personaTabs[currentTabId] = request.persona;
      
      chrome.storage.local.set({ personaTabs }, () => {
        createPersonaOverlay(request.persona);
        sendResponse({ success: true });
      });
    });
    return true;
  }
});