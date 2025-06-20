// js/content/overlay/drag.ts
import { Theme } from '../../types.js';

export function initializeDrag(overlay: HTMLElement, theme: Theme): void {
  let isDragging = false;
  let currentX: number;
  let currentY: number;
  let initialX: number;
  let initialY: number;

  // Calculate scale from theme
  const scale = theme["overlay-scale"].includes('%') ?
    Math.min(parseInt(theme["overlay-scale"]) / 100, 2) : // Convert percentage to scale, max 200%
    parseInt(theme["overlay-scale"]) / 100; // Convert direct number to scale

  const dragStart = (e: MouseEvent) => {
    const rect = overlay.getBoundingClientRect();
    if (e.target === overlay) {
      isDragging = true;
      initialX = e.clientX - rect.left;
      initialY = e.clientY - rect.top;
    }
  };

  const drag = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const rect = overlay.getBoundingClientRect();
      
      // Adjust boundaries considering scale
      const scaledWidth = rect.width / scale;
      const scaledHeight = rect.height / scale;
      
      currentX = Math.min(Math.max(0, currentX), viewportWidth - scaledWidth);
      currentY = Math.min(Math.max(0, currentY), viewportHeight - scaledHeight);
      
      overlay.style.left = `${currentX}px`;
      overlay.style.top = `${currentY}px`;
      overlay.style.transform = `scale(${scale})`;
      overlay.style.transformOrigin = '0 0';
    }
  };

  const dragEnd = (): void => {
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