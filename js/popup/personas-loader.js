
import { generatePersonasHTML } from './templates/personas.js';

async function loadPersonasContent() {
    try {
        const result = await chrome.storage.local.get('pendingTemplate');
        if (!result.pendingTemplate) {
            document.getElementById('content').innerHTML = '<p class="text-center p-4">No demo data found</p>';
            return;
        }

        const { styles, content } = await generatePersonasHTML(result.pendingTemplate);

        const style = document.createElement('style');
        style.textContent = styles;
        document.head.appendChild(style);

        document.getElementById('content').innerHTML = content;
    } catch (error) {
        console.error('Error loading personas:', error);
        document.getElementById('content').innerHTML = `
            <div class="alert alert-error shadow-lg m-4">
                <div>
                    <span>Error loading personas content: ${error.message}</span>
                </div>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', loadPersonasContent);