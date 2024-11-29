import { generateOverviewHTML } from './templates/overview.js';
import { initializeTheme } from '../utils/theme.js';
// Import CSS directly in the JS

import '../../css/components/overview.css';
import '../../css/components/video-player.css';

// Add console log for debugging
async function loadOverviewContent() {
    try {
        console.log('Loading overview content...');
        const params = new URLSearchParams(window.location.search);
        const currentStep = params.has('step') ? parseInt(params.get('step')) : null;

        // Get content from extension storage
        const result = await chrome.storage.local.get('pendingTemplate');
        console.log('result:', result);
        if (!result.pendingTemplate) {
            document.getElementById('content').innerHTML = '<p class="text-center p-4">No demo data found</p>';
            return;
        }

        // Generate the HTML content
        const { styles, content } = await generateOverviewHTML(result.pendingTemplate, currentStep);

        // Add styles
        const style = document.createElement('style');
        style.textContent = styles;
        document.head.appendChild(style);

        // Add content
        document.getElementById('content').innerHTML = content;

        // Scroll current step into view if specified
        if (currentStep !== null) {
            const currentStepCard = document.querySelector('.current-step');
            if (currentStepCard) {
                currentStepCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }

        // Add video drag functionality only if we have a current step and it has a video
        const videoContainer = document.getElementById('draggableVideo');
        if (videoContainer && currentStep !== null && result.pendingTemplate.steps[currentStep]?.video) {
            const dragHandle = videoContainer.querySelector('.video-drag-handle');
            
            if (videoContainer && dragHandle) {
                let isDragging = false;
                let isResizing = false;
                let startX;
                let startY;
                let lastX = 20; // Default right position
                let lastY = 20; // Default top position
                let startWidth;
                let startHeight;
                
                // Load saved position and size
                const savedState = await chrome.storage.local.get(['videoPosition', 'videoSize']);
                if (savedState.videoPosition) {
                    lastX = savedState.videoPosition.x;
                    lastY = savedState.videoPosition.y;
                    videoContainer.style.left = `${lastX}px`;
                    videoContainer.style.top = `${lastY}px`;
                }
                if (savedState.videoSize) {
                    videoContainer.style.width = `${savedState.videoSize.width}px`;
                    videoContainer.style.height = `${savedState.videoSize.height}px`;
                }

                function dragStart(e) {
                    const isHandle = e.target === dragHandle || e.target === dragHandle.querySelector('span');
                    if (isHandle) {
                        isDragging = true;
                        dragHandle.classList.add('dragging');
                        startX = e.clientX - lastX;
                        startY = e.clientY - lastY;
                    }
                }

                function drag(e) {
                    if (isDragging) {
                        e.preventDefault();
                        const x = e.clientX - startX;
                        const y = e.clientY - startY;

                        // Keep video within viewport bounds
                        const bounds = videoContainer.getBoundingClientRect();
                        const maxX = window.innerWidth - bounds.width;
                        const maxY = window.innerHeight - bounds.height;

                        lastX = Math.min(Math.max(0, x), maxX);
                        lastY = Math.min(Math.max(0, y), maxY);

                        videoContainer.style.left = `${lastX}px`;
                        videoContainer.style.top = `${lastY}px`;
                    }
                }

                function dragEnd() {
                    if (isDragging) {
                        isDragging = false;
                        dragHandle.classList.remove('dragging');
                        chrome.storage.local.set({
                            videoPosition: {
                                x: lastX,
                                y: lastY
                            }
                        });
                    }
                }

                dragHandle.addEventListener('mousedown', dragStart);
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', dragEnd);

                // Add resize functionality
                const resizeHandle = videoContainer.querySelector('.video-resize-handle');
                
                function resizeStart(e) {
                    if (e.target === resizeHandle) {
                        isResizing = true;
                        startX = e.clientX;
                        startY = e.clientY;
                        startWidth = videoContainer.offsetWidth;
                        startHeight = videoContainer.offsetHeight;
                    }
                }

                function resize(e) {
                    if (!isResizing) return;
                    e.preventDefault();
                    
                    const width = startWidth + (e.clientX - startX);
                    const height = startHeight + (e.clientY - startY);
                    
                    // Enforce minimum size
                    if (width >= 150) {
                        videoContainer.style.width = `${width}px`;
                    }
                    if (height >= 266) {
                        videoContainer.style.height = `${height}px`;
                    }

                    // Save size
                    chrome.storage.local.set({
                        videoSize: {
                            width: videoContainer.offsetWidth,
                            height: videoContainer.offsetHeight
                        }
                    });
                }

                function resizeEnd() {
                    isResizing = false;
                }

                resizeHandle.addEventListener('mousedown', resizeStart);
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', resizeEnd);

                // Optional: Add minimize functionality
                const minimizeBtn = dragHandle.querySelector('.minimize-btn');
                const videoContent = videoContainer.querySelector('.video-content');
                minimizeBtn?.addEventListener('click', () => {
                    videoContent.style.display = videoContent.style.display === 'none' ? 'block' : 'none';
                    minimizeBtn.textContent = videoContent.style.display === 'none' ? '□' : '_';
                });
            }
        }

        // Initialize theme after content is loaded
        initializeTheme(document.body);
    } catch (error) {
        console.error('Error loading overview:', error);
        document.getElementById('content').innerHTML = `
            <div class="alert alert-error shadow-lg m-4">
                <div>
                    <span>Error loading demo content: ${error.message}</span>
                </div>
            </div>`;
    }
}

// Make sure the script runs after DOM is loaded
window.addEventListener('DOMContentLoaded', loadOverviewContent);