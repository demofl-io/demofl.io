import { generateOverviewHTML } from './templates/overview.js';
import { initializeTheme } from '../utils/theme.js';

async function loadOverviewContent() {
    try {
        // Get content from extension storage
        const result = await chrome.storage.local.get('pendingTemplate');
        console.log('result:', result);
        if (!result.pendingTemplate) {
            document.getElementById('content').innerHTML = '<p class="text-center p-4">No demo data found</p>';
            return;
        }

        // Generate the HTML content
        const { styles, content } = await generateOverviewHTML(result.pendingTemplate);

        // Add styles
        const style = document.createElement('style');
        style.textContent = styles;
        document.head.appendChild(style);

        // Add content
        document.getElementById('content').innerHTML = content;

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

document.addEventListener('DOMContentLoaded', loadOverviewContent);