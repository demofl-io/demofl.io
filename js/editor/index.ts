// js/editor/index.ts
import { formatIcons } from './utils/icons.js';
import { initTabHandlers } from './handlers/tabs.js';
import { initFormHandler } from './handlers/form.js';
import { createPersonaField } from './components/persona.js';
import { createStepField } from './components/step.js';
import availableIcons from '../../assets/material-icons.json';
import { initializeTheme } from '../utils/theme.js';
import { DemoFlowTemplate, FormattedIcon, StorageResult } from '../types.js';

// Add this function before the DOMContentLoaded event listener
function initializeComponents(data: DemoFlowTemplate, formattedIcons: FormattedIcon): void {
    const personasContainer = document.getElementById('personasContainer');
    const stepsContainer = document.getElementById('stepsContainer');
    const addPersonaBtn = document.getElementById('addPersonaBtn');
    const addStepBtn = document.getElementById('addStepBtn');

    if (!personasContainer || !stepsContainer || !addPersonaBtn || !addStepBtn) {
        console.error('Required DOM elements not found');
        return;
    }

    // Clear existing content
    personasContainer.innerHTML = '';
    stepsContainer.innerHTML = '';

    // Initialize Personas
    const personas = data.personas || {};
    Object.entries(personas).forEach(([key, persona]) => {
        const personaDiv = createPersonaField(key, persona);
        
        // Add remove handler
        const removeBtn = personaDiv.querySelector('.removePersona');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                personasContainer.removeChild(personaDiv);
            });
        }
        
        personasContainer.appendChild(personaDiv);
    });

    // Initialize Steps
    const steps = data.steps || [];
    steps.forEach((step) => {
        const stepDiv = createStepField(
            step.title || '', 
            step.description || '', 
            step.urls || [], 
            step.persona || '', 
            step.icon || '',
            formattedIcons,
            personas,
            step.tabColor || 'green'
        );

        // Add event listeners for remove step
        stepDiv.querySelector('.removeStep').addEventListener('click', () => {
            stepsContainer.removeChild(stepDiv);
        });

        // Add URL handlers
        const urlsContainer = stepDiv.querySelector('.urls-container') as any;
        const addUrlBtn = stepDiv.querySelector('.addUrl');
        
        addUrlBtn?.addEventListener('click', () => {
            addUrlField(urlsContainer);
        });

        // Add icon search handlers
        const searchInput = stepDiv.querySelector('.step-icon-search') as any;
        const iconDropdown = stepDiv.querySelector('.icon-dropdown');

        searchInput?.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const icons = iconDropdown.querySelectorAll('.icon-item');
            icons.forEach((iconItem: any) => {
                const iconName = iconItem.getAttribute('data-icon').toLowerCase();
                iconItem.style.display = iconName.includes(query) ? 'flex' : 'none';
            });
        });

        // Handle icon selection
        iconDropdown?.querySelectorAll('.icon-item').forEach((iconItem: any) => {
            iconItem.addEventListener('click', () => {
                const selectedIcon = iconItem.getAttribute('data-icon');
                const hiddenInput = stepDiv.querySelector('.selected-icon') as any;
                hiddenInput.value = selectedIcon;
                searchInput.value = selectedIcon;
                iconDropdown.classList.add('hidden');
            });
        });

        stepsContainer.appendChild(stepDiv);
    });

    // Add event listeners for add buttons
    addPersonaBtn.addEventListener('click', () => {
        const personaDiv = createPersonaField();
        
        // Add remove handler
        personaDiv.querySelector('.removePersona').addEventListener('click', () => {
            personasContainer.removeChild(personaDiv);
        });
        
        personasContainer.appendChild(personaDiv);
    });

    addStepBtn.addEventListener('click', () => {
        const stepDiv = createStepField('', '', [], '', '', formattedIcons, personas);
        
        // Add the same event listeners as above
        stepDiv.querySelector('.removeStep').addEventListener('click', () => {
            stepsContainer.removeChild(stepDiv);
        });

        // Add URL handlers
        const urlsContainer = stepDiv.querySelector('.urls-container') as any;
        const addUrlBtn = stepDiv.querySelector('.addUrl');
        
        addUrlBtn?.addEventListener('click', () => {
            addUrlField(urlsContainer);
        });

        // Add icon search handlers
        const searchInput = stepDiv.querySelector('.step-icon-search') as any;
        const iconDropdown = stepDiv.querySelector('.icon-dropdown');

        searchInput?.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const icons = iconDropdown.querySelectorAll('.icon-item');
            icons.forEach((iconItem: any) => {
                const iconName = iconItem.getAttribute('data-icon').toLowerCase();
                iconItem.style.display = iconName.includes(query) ? 'flex' : 'none';
            });
        });

        // Handle icon selection
        iconDropdown?.querySelectorAll('.icon-item').forEach((iconItem: any) => {
            iconItem.addEventListener('click', () => {
                const selectedIcon = iconItem.getAttribute('data-icon');
                const hiddenInput = stepDiv.querySelector('.selected-icon') as any;
                hiddenInput.value = selectedIcon;
                searchInput.value = selectedIcon;
                iconDropdown.classList.add('hidden');
            });
        });

        stepsContainer.appendChild(stepDiv);
    });
}

// Also add this helper function
function addUrlField(container: any, url: string = ''): void {
    const urlDiv = document.createElement('div');
    urlDiv.className = 'flex space-x-2 items-center';
    
    urlDiv.innerHTML = `
        <input type="url" class="input input-bordered step-url flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://example.com" value="${url}" required>
        <button type="button" class="btn btn-sm btn-error removeUrl">🗑️</button>
    `;

    urlDiv.querySelector('.removeUrl').addEventListener('click', () => {
        container.removeChild(urlDiv);
    });

    container.appendChild(urlDiv);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme toggle
    initializeTheme();
    
    const formattedIcons = formatIcons(availableIcons);
    
    // Initialize tab handlers
    initTabHandlers();

    // Load template data
    const result: StorageResult = await chrome.storage.local.get('editingTemplate');
    if (!result.editingTemplate) {
        alert('No template selected for editing.');
        window.close();
        return;
    }

    // Set demo name in header
    const demoNameElement = document.getElementById('demoName');
    if (demoNameElement) {
        demoNameElement.textContent = result.editingTemplate.name;
    }

    // Initialize form with template data
    const editForm = document.getElementById('editForm') as HTMLFormElement;
    if (editForm) {
        initFormHandler(editForm, result.editingTemplate);
    }

    // Initialize components
    initializeComponents(result.editingTemplate.data, formattedIcons);
});