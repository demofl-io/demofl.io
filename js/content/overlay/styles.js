// js/content/overlay/styles.js
export function generateOverlayStyles(theme, hposition, vposition) {
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

  const h = positions.horizontal[hposition] || positions.horizontal.center;
  const v = positions.vertical[vposition] || positions.vertical.top;

  return `
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
    transition: transform 0.3s ease-out;
  `;
}