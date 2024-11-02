// js/content/overlay/styles.js
export function generateOverlayStyles(theme, overlayh, overlayv) {
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

  const h = positions.horizontal[overlayh] || positions.horizontal.center;
  const v = positions.vertical[overlayv] || positions.vertical.top;

  // Handle the overlay-scale from theme as scale factor
  const scale = theme["overlay-scale"].includes('%') ?
    Math.min(parseInt(theme["overlay-scale"]) / 100, 2) : // Convert percentage to scale, max 200%
    parseInt(theme["overlay-scale"]) / 100; // Convert direct number to scale

  // Base width for the overlay before scaling
  const baseWidth = '300px';

  return `
    position: fixed;
    ${h.position}
    ${v.position}
    ${h.transform || v.transform ? `transform: ${[h.transform, v.transform, `scale(${scale})`].filter(Boolean).join(' ')};` : `transform: scale(${scale});`}
    background-color: ${theme["overlay-background"]};
    color: ${theme["overlay-color"]};
    font-family: ${theme["brand-font"]}, sans-serif;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    width: ${baseWidth};
    cursor: move;
    user-select: none;
    transition: transform 0.3s ease-out;
    transform-origin: ${overlayh === 'right' ? 'right' : overlayh === 'left' ? 'left' : 'center'} 
                     ${overlayv === 'bottom' ? 'bottom' : overlayv === 'top' ? 'top' : 'center'};
  `;
}