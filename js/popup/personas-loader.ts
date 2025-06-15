import { generatePersonasHTML } from './templates/personas.js';
import { initializeTheme } from '../utils/theme.js';
import '../../css/components/personas.css';
import { DemoFlowTemplate, StorageResult } from '../types.js';

async function loadPersonasContent(): Promise<void> {
    try {
        const result: StorageResult = await chrome.storage.local.get('pendingTemplate');
        if (!result.pendingTemplate) {
            const contentElement = document.getElementById('content');
            if (contentElement) {
                contentElement.innerHTML = '<p class="text-center p-4">No demo data found</p>';
            }
            return;
        }

        const { styles, content } = await generatePersonasHTML(result.pendingTemplate as DemoFlowTemplate);

        const style = document.createElement('style');
        style.textContent = styles;
        document.head.appendChild(style);

        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.innerHTML = content;
        }

        // Initialize theme after content is loaded
        initializeTheme(document.body);
    } catch (error) {
        console.error('Error loading personas:', error);
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="alert alert-error shadow-lg m-4">
                    <div>
                        <span>Error loading personas content: ${(error as Error).message}</span>
                    </div>
                </div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', loadPersonasContent);