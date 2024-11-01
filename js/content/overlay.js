// js/content/overlay.js
export function createPersonaOverlay(persona) {
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
  
        // Calculate initial position based on theme settings
        const positions = {
          horizontal: {
            left: { position: 'left: 20px;', transform: 'translateX(0)' },
            center: { position: 'left: 50%;', transform: 'translateX(-50%)' },
            right: { position: 'right: 20px;', transform: 'translateX(0)' }
          },
          vertical: {
            top: { position: 'top: 20px;', transform: '' },
            middle: { position: 'top: 50%;', transform: 'translateY(-50%)' },
            bottom: { position: 'bottom: 20px;', transform: '' }
          }
        };
  
        const h = positions.horizontal[theme.hposition] || positions.horizontal.center;
        const v = positions.vertical[theme.vposition] || positions.vertical.top;
  
        // Remove this line that causes the error
        // const { position, transform } = getInitialPosition();
  
        const overlay = document.createElement('div');
        overlay.className = 'persona-overlay';
  
        // Add animation keyframes based on position
        const style = document.createElement('style');
        style.textContent = `
          @keyframes slideInLeft {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideInCenter {
            0% {
              transform: translate(-50%, -100%);
              opacity: 0;
            }
            100% {
              transform: translate(-50%, 0);
              opacity: 1;
            }
          }
          @keyframes slideInRight {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `;
        document.head.appendChild(style);
  
        // Get animation name based on position
        const getAnimationName = () => {
          switch (theme.hposition) {
            case 'left': return 'slideInLeft';
            case 'right': return 'slideInRight';
            default: return 'slideInCenter';
          }
        };
  
        // Update overlay styles to include theme
        overlay.style.cssText = `
          position: fixed;
          ${h.position}
          ${v.position}
          ${h.transform || v.transform ? `transform: ${[h.transform, v.transform].filter(Boolean).join(' ')};` : ''}
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
          width: 300px;
          cursor: move;
          user-select: none;
          animation: ${getAnimationName()} 0.3s ease-out forwards;
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
          const rect = overlay.getBoundingClientRect();
          
          if (e.target === overlay) {
            isDragging = true;
            
            // Handle center position differently
            if (theme.hposition === 'center') {
              initialX = e.clientX - rect.left - (rect.width / 2); // Add half width to compensate for center transform
            } else {
              initialX = e.clientX - rect.left;
            }
            
            if (theme.vposition === 'bottom') {
              initialY = window.innerHeight - (e.clientY - rect.height);
            } else {
              initialY = e.clientY - rect.top;
            }
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
            const rect = overlay.getBoundingClientRect();
            
            // Simplify bounds check (same for all positions)
            currentX = Math.min(Math.max(0, currentX), viewportWidth - rect.width);
            
            if (theme.vposition === 'bottom') {
              currentY = Math.max(20, window.innerHeight - (e.clientY + initialY));
              overlay.style.bottom = `${currentY}px`;
              overlay.style.top = 'auto';
            } else {
              currentY = Math.min(Math.max(0, currentY), viewportHeight - rect.height);
              overlay.style.top = `${currentY}px`;
              overlay.style.bottom = 'auto';
            }
            
            overlay.style.left = `${currentX}px`;
            overlay.style.transform = 'none'; // Remove transform during drag
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