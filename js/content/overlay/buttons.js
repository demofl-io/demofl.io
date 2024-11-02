// js/content/overlay/buttons.js
export function createCloseButton(theme, onClose) {
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${theme["overlay-background"]};
    color: ${theme["overlay-color"]};
    border: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    z-index: 10000;
  `;

  closeButton.addEventListener('click', onClose);
  return closeButton;
}