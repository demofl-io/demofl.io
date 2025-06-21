import { generateOverviewHTML } from './templates/overview.js';
import { initializeTheme } from '../utils/theme.js';
import { VideoContainer } from '../components/VideoContainer.js';
import '../../css/components/overview.css';
import '../../css/components/video-player.css';
import { DemoFlowTemplate, StorageResult } from '../types.js';

// Add console log for debugging
async function loadOverviewContent(): Promise<void> {
    try {
        console.log('Loading overview content...');
        const params = new URLSearchParams(window.location.search);
        const currentStep: number | null = params.has('step') ? parseInt(params.get('step')!) : null;

        // Get content from extension storage
        const result: StorageResult = await chrome.storage.local.get('pendingTemplate');
        console.log('result:', result);
        if (!result.pendingTemplate) {
            const contentElement = document.getElementById('content');
            if (contentElement) {
                contentElement.innerHTML = '<p class="text-center p-4">No demo data found</p>';
            }
            return;
        }

        // Generate the HTML content
        const { styles, content } = await generateOverviewHTML(result.pendingTemplate as DemoFlowTemplate, currentStep);

        // Add styles
        const style = document.createElement('style');
        style.textContent = styles;
        document.head.appendChild(style);

        // Add content
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.innerHTML = content;
        }

        // Scroll current step into view if specified
        if (currentStep !== null) {
            const currentStepCard = document.querySelector('.current-step');
            if (currentStepCard) {
                currentStepCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }

        // Add video drag functionality only if we have a current step and it has a video
        const videoContainer = document.getElementById('draggableVideo');
        const template = result.pendingTemplate as DemoFlowTemplate;
        if (videoContainer && currentStep !== null && template.steps[currentStep]?.video) {
            new VideoContainer(videoContainer);
        }

        // Initialize theme after content is loaded
        initializeTheme(document.body);
    } catch (error) {
        console.error('Error loading overview:', error);
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="alert alert-error shadow-lg m-4">
                    <div>
                        <span>Error loading demo content: ${(error as Error).message}</span>
                    </div>
                </div>`;
        }
    }
}

// Make sure the script runs after DOM is loaded
window.addEventListener('DOMContentLoaded', loadOverviewContent);