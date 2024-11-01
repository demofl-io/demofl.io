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
    
    port.onDisconnect.addListener(() => {
      console.log("Port disconnected");
      // Only clean up on actual tab close
      if (document.visibilityState === 'hidden') {
        window.addEventListener('unload', () => {
          if (currentTabId) {
            console.log("Cleaning up tab:", currentTabId);
            chrome.storage.local.get(["personaTabs"], (result) => {
              const personaTabs = result.personaTabs || {};
              delete personaTabs[currentTabId];
              chrome.storage.local.set({ personaTabs });
            });
          }
        });
      }
    });
    
  } catch (error) {
    console.error("Connection error:", error);
    // Retry connection after a delay
    setTimeout(connectToBackground, 1000);
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
      setTimeout(init, 1000); // Retry after 1 second
      return;
    }
    
    if (response && response.tabId) {
      currentTabId = response.tabId;
      console.log("Tab ID set to:", currentTabId);
      
      // Connect to background first
      connectToBackground();
      
      // Then check storage
      await checkStoredPersona();
    } else {
      console.error("No tab ID received");
      setTimeout(init, 1000); // Retry after 1 second
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

    // Update overlay styles to include animation
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translate(-50%, 0);
      background-color: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 9999;
      font-family: Arial, sans-serif;
      max-width: 300px;
      cursor: move;
      user-select: none;
      animation: slideIn 0.3s ease-out forwards;
      transition: transform 0.3s ease-out;
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: white;
      border: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #666;
      z-index: 10000;
    `;
    
    closeButton.addEventListener('click', () => {
      overlay.style.display = 'none';
    });

    // Add hover effect
    closeButton.addEventListener('mouseover', () => {
      closeButton.style.backgroundColor = '#f0f0f0';
    });
    closeButton.addEventListener('mouseout', () => {
      closeButton.style.backgroundColor = 'white';
    });

    overlay.appendChild(closeButton);

    // Rest of your existing overlay creation code...
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
        `<div style="width: 48px; height: 48px; border-radius: 50%; background-color: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #1a1a1a;">
          ${persona.name.charAt(0)}
        </div>`
      }
      <div style="color: #1a1a1a;">
        <div style="font-weight: bold; margin-bottom: 4px;">${persona.name}</div>
        <div style="font-size: 0.9em; color: #666;">${persona.title}</div>
      </div>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    console.log("Overlay created successfully");
    
    // Your existing drag functionality...
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    const dragStart = (e) => {
      initialX = e.clientX - overlay.offsetLeft;
      initialY = e.clientY - overlay.offsetTop;
      isDragging = true;
    };

    const dragMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        const rect = overlay.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        currentX = Math.max(0, Math.min(currentX, viewportWidth - rect.width));
        currentY = Math.max(0, Math.min(currentY, viewportHeight - rect.height));
        
        overlay.style.left = `${currentX}px`;
        overlay.style.top = `${currentY}px`;
        overlay.style.transform = 'none';
      }
    };

    const dragEnd = () => {
      isDragging = false;
    };

    overlay.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);

  } catch (error) {
    console.error("Error creating overlay:", error);
  }
}

// Check for stored persona data when page loads
chrome.storage.local.get(["personaTabs"], (result) => {
  const personaTabs = result.personaTabs || {};
  if (currentTabId && personaTabs[currentTabId]) {
    createPersonaOverlay(personaTabs[currentTabId]);
  }
});

// Message listener
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Message received in content script:", request);
  
  if (request.action === "showPersona") {
    try {
      console.log("Show persona request received for tab:", currentTabId);
      
      // Store the persona data immediately
      const personaData = request.persona;
      chrome.storage.local.get(["personaTabs"], (result) => {
        const personaTabs = result.personaTabs || {};
        personaTabs[currentTabId] = personaData;
        
        chrome.storage.local.set({ personaTabs }, () => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            sendResponse({ success: false });
            return;
          }
          
          console.log("Creating overlay for persona on Bing");
          createPersonaOverlay(personaData);
          sendResponse({ success: true });
        });
      });
      
      return true; // Keep the message channel open
    } catch (error) {
      console.error("Error handling showPersona message:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
});