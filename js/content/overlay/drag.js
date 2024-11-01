// js/content/overlay/drag.js
export function initializeDrag(overlay, theme) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  const dragStart = (e) => {
    const rect = overlay.getBoundingClientRect();
    if (e.target === overlay) {
      isDragging = true;
      initialX = e.clientX - rect.left;
      initialY = e.clientY - rect.top;
    }
  };

  const drag = (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const rect = overlay.getBoundingClientRect();
      
      currentX = Math.min(Math.max(0, currentX), viewportWidth - rect.width);
      currentY = Math.min(Math.max(0, currentY), viewportHeight - rect.height);
      
      overlay.style.left = `${currentX}px`;
      overlay.style.top = `${currentY}px`;
      overlay.style.transform = 'none';
    }
  };

  const dragEnd = () => {
    isDragging = false;
  };

  overlay.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  return () => {
    overlay.removeEventListener('mousedown', dragStart);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
  };
}