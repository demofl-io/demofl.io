
export class VideoContainer {
    constructor(container, options = {}) {
        this.container = container;
        this.dragHandle = container.querySelector('.video-drag-handle');
        this.resizeHandle = container.querySelector('.video-resize-handle');
        this.minimizeBtn = this.dragHandle.querySelector('.minimize-btn');
        this.videoContent = container.querySelector('.video-content');
        
        this.isDragging = false;
        this.isResizing = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = options.x || 20;
        this.lastY = options.y || 20;
        this.startWidth = 0;
        this.startHeight = 0;

        this.init();
    }

    async init() {
        // Load saved position and size
        const savedState = await chrome.storage.local.get(['videoPosition', 'videoSize']);
        if (savedState.videoPosition) {
            this.lastX = savedState.videoPosition.x;
            this.lastY = savedState.videoPosition.y;
            this.updatePosition();
        }
        if (savedState.videoSize) {
            this.container.style.width = `${savedState.videoSize.width}px`;
            this.container.style.height = `${savedState.videoSize.height}px`;
        }

        // Bind event listeners
        this.dragHandle.addEventListener('mousedown', this.dragStart.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.dragEnd.bind(this));

        this.resizeHandle.addEventListener('mousedown', this.resizeStart.bind(this));
        document.addEventListener('mousemove', this.resize.bind(this));
        document.addEventListener('mouseup', this.resizeEnd.bind(this));

        this.minimizeBtn?.addEventListener('click', this.toggleMinimize.bind(this));
    }

    dragStart(e) {
        const isHandle = e.target === this.dragHandle || e.target === this.dragHandle.querySelector('span');
        if (isHandle) {
            this.isDragging = true;
            this.dragHandle.classList.add('dragging');
            this.startX = e.clientX - this.lastX;
            this.startY = e.clientY - this.lastY;
        }
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const x = e.clientX - this.startX;
        const y = e.clientY - this.startY;

        const bounds = this.container.getBoundingClientRect();
        const maxX = window.innerWidth - bounds.width;
        const maxY = window.innerHeight - bounds.height;

        this.lastX = Math.min(Math.max(0, x), maxX);
        this.lastY = Math.min(Math.max(0, y), maxY);

        this.updatePosition();
    }

    dragEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.dragHandle.classList.remove('dragging');
        this.savePosition();
    }

    resizeStart(e) {
        if (e.target === this.resizeHandle) {
            this.isResizing = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startWidth = this.container.offsetWidth;
            this.startHeight = this.container.offsetHeight;
        }
    }

    resize(e) {
        if (!this.isResizing) return;
        e.preventDefault();
        
        const width = this.startWidth + (e.clientX - this.startX);
        const height = this.startHeight + (e.clientY - this.startY);
        
        if (width >= 150) this.container.style.width = `${width}px`;
        if (height >= 266) this.container.style.height = `${height}px`;

        this.saveSize();
    }

    resizeEnd() {
        this.isResizing = false;
    }

    toggleMinimize() {
        this.videoContent.style.display = this.videoContent.style.display === 'none' ? 'block' : 'none';
        this.minimizeBtn.textContent = this.videoContent.style.display === 'none' ? '□' : '_';
    }

    updatePosition() {
        this.container.style.left = `${this.lastX}px`;
        this.container.style.top = `${this.lastY}px`;
    }

    savePosition() {
        chrome.storage.local.set({
            videoPosition: { x: this.lastX, y: this.lastY }
        });
    }

    saveSize() {
        chrome.storage.local.set({
            videoSize: {
                width: this.container.offsetWidth,
                height: this.container.offsetHeight
            }
        });
    }
}