import { saveTemplate } from './templates.js';

import availableIcons from '../../assets/material-icons.json';
document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('editForm');
    const addPersonaBtn = document.getElementById('addPersonaBtn');
    const personasContainer = document.getElementById('personasContainer');
    const addStepBtn = document.getElementById('addStepBtn');
    const stepsContainer = document.getElementById('stepsContainer');

    // Convert icon names to objects with display-friendly names
    const formattedIcons = availableIcons.map(iconName => ({
        name: iconName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()), // Capitalize and replace underscores
        value: iconName,
        class: 'material-icons'
    }));

    // Load the template to edit
    const result = await chrome.storage.local.get('editingTemplate');
    if (!result.editingTemplate) {
        alert('No template selected for editing.');
        window.close();
        return;
    }

    const { name, data, type } = result.editingTemplate;

    // ----- Tab Switching Functionality Start -----
    const tabs = document.querySelectorAll('.tabs .tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('tab-active'));
            // Hide all contents
            contents.forEach(c => c.classList.add('hidden'));
            // Add active class to clicked tab
            tab.classList.add('tab-active');
            // Show corresponding content
            const target = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(target);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
    // ----- Tab Switching Functionality End -----

    // Populate Theme Fields
    document.getElementById('brandColor').value = data.theme['brand-color'] || '#000000';
    document.getElementById('overlayColor').value = data.theme['overlay-color'] || '#ffffff';
    document.getElementById('overlayBackground').value = data.theme['overlay-background'] || '#111827';
    document.getElementById('brandFont').value = data.theme['brand-font'] || 'Arial';
    document.getElementById('overlayH').value = data.theme['overlay-h'] || 'center';
    document.getElementById('overlayV').value = data.theme['overlay-v'] || 'top';
    document.getElementById('overlayScale').value = data.theme['overlay-scale'] || '100%';

    // Populate Product Fields
    document.getElementById('productName').value = data.product.name || '';
    document.getElementById('productLogo').value = data.product.logourl || '';

    // Populate Customer Fields
    document.getElementById('customerName').value = data.customer.name || '';
    document.getElementById('customerLogo').value = data.customer.logourl || '';

    // Populate Personas
    const personas = data.personas || {};
    for (const [key, persona] of Object.entries(personas)) {
        addPersonaField(key, persona); // Pass both key and persona
    }

    // **Clear Existing Steps Before Adding New Ones**
    stepsContainer.innerHTML = ''; // Clear any existing content

    // Populate Steps
    const steps = data.steps || [];
    steps.forEach((step, index) => {
        addStepField(step.title || '', step.description || '', step.urls || [], step.persona || '', step.icon || '');
    });

    // Handle Add Persona
    addPersonaBtn.addEventListener('click', () => {
        addPersonaField();
    });

    // Handle Add Step
    addStepBtn.addEventListener('click', () => {
        addStepField();
    });

    // Form Submission Handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Gather Theme Data
        const theme = {
            'brand-color': document.getElementById('brandColor').value,
            'overlay-color': document.getElementById('overlayColor').value,
            'overlay-background': document.getElementById('overlayBackground').value,
            'brand-font': document.getElementById('brandFont').value,
            'overlay-h': document.getElementById('overlayH').value,
            'overlay-v': document.getElementById('overlayV').value,
            'overlay-scale': document.getElementById('overlayScale').value
        };

        // Gather Product Data
        const product = {
            name: document.getElementById('productName').value,
            logourl: document.getElementById('productLogo').value
        };

        // Gather Customer Data
        const customer = {
            name: document.getElementById('customerName').value,
            logourl: document.getElementById('customerLogo').value
        };

        // Gather Personas Data (Corrected from 'personnas' to 'personas')
        const personasElements = personasContainer.querySelectorAll('.persona');
        const personas = {};
        personasElements.forEach(personaEl => {
            const key = personaEl.querySelector('.persona-key')?.value.trim();
            const name = personaEl.querySelector('.persona-display-name')?.value.trim();
            const title = personaEl.querySelector('.persona-title')?.value.trim();
            const pictureurl = personaEl.querySelector('.persona-picture')?.value.trim();
            const icon = personaEl.querySelector('.persona-icon')?.value.trim();

            if (key && name && title && icon) {
                personas[key] = { name, title, pictureurl, icon };
            }
        });

        // Gather Steps Data
        const stepsElements = stepsContainer.querySelectorAll('.step');
        const steps = [];
        stepsElements.forEach(stepEl => {
            const title = stepEl.querySelector('.step-title')?.value.trim();
            const description = stepEl.querySelector('.step-description')?.value.trim();
            const personaKey = stepEl.querySelector('.step-persona')?.value;
            const icon = stepEl.querySelector('.step-icon')?.value;
            const urls = Array.from(stepEl.querySelectorAll('.step-url'))
                .map(input => input.value.trim())
                .filter(url => url);

            if (title && description && personaKey && icon && urls.length > 0) {
                steps.push({ title, description, urls, persona: personaKey, icon });
            } else {
                console.warn('Incomplete step data:', { title, description, personaKey, icon, urls });
            }
        });

        // Construct the updated template (Corrected from 'personnas' to 'personas')
        const updatedTemplate = {
            theme,
            product,
            customer,
            personas, // Updated key
            steps
        };

        // Debug: Log the updated template to verify
        console.log('Updated Template:', updatedTemplate);

        // Save the updated template
        const saveSuccess = await saveTemplate(updatedTemplate, name, type);
        if (saveSuccess) {
            alert('Template saved successfully.');
            // Clear the editingTemplate from storage
            await chrome.storage.local.remove('editingTemplate');
            window.close();
        } else {
            alert('Failed to save the template. Please check the console for errors.');
        }
    });

    // Function to Add Persona Fields
    function addPersonaField(key = '', persona = {}) {
        const personaDiv = document.createElement('div');
        personaDiv.className = 'persona flex space-x-4 items-center';

        // Generate Icon Options (Optional if using search)
        // const iconOptions = formattedIcons.map(icon => `
        //     <option value="${icon.value}" ${persona.icon === icon.value ? 'selected' : ''}>${icon.name}</option>
        // `).join('');

        personaDiv.innerHTML = `
            <input type="text" class="input input-bordered persona-key w-24" placeholder="Key" value="${key}" required>
            <input type="text" class="input input-bordered persona-display-name flex-1" placeholder="Name" value="${persona.name || ''}" required>
            <input type="text" class="input input-bordered persona-title w-32" placeholder="Title" value="${persona.title || ''}" required>
            <input type="text" class="input input-bordered persona-picture flex-1" placeholder="Picture URL" value="${persona.pictureurl || ''}">
            <button type="button" class="btn btn-sm btn-error removePersona">🗑️</button>
        `;

        // Handle Remove Persona
        personaDiv.querySelector('.removePersona').addEventListener('click', () => {
            personasContainer.removeChild(personaDiv);
        });

        personasContainer.appendChild(personaDiv);
    }

    // Function to Add Step Fields with Searchable Icon Selector
    function addStepField(title = '', description = '', urls = [], persona = '', icon = '') {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step p-4 border border-gray-300 rounded-lg';

        // Generate Icon Items with Search Functionality
        const iconItems = formattedIcons.map(iconObj => `
            <div class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer icon-item" data-icon="${iconObj.value}">
                <span class="${iconObj.class} mr-2 dark:text-white">${iconObj.value}</span>
                <span class="dark:text-white">${iconObj.name}</span>
            </div>
        `).join('');

        stepDiv.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold">Step</h3>
                <button type="button" class="btn btn-sm btn-error removeStep">🗑️</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="label">
                        <span class="label-text">Title</span>
                    </label>
                    <input type="text" class="input input-bordered step-title w-full" placeholder="Step Title" value="${title}" required>
                </div>
                <div>
                    <label class="label">
                        <span class="label-text">Description</span>
                    </label>
                    <textarea class="textarea textarea-bordered step-description w-full" placeholder="Step Description" required>${description}</textarea>
                </div>
                <div>
                    <label class="label">
                        <span class="label-text">Persona</span>
                    </label>
                    <select class="select select-bordered step-persona w-full" required>
                        <option value="" disabled ${!persona ? 'selected' : ''}>Select Persona</option>
                        ${Object.keys(data.personas).map(key => `
                            <option value="${key}" ${persona === key ? 'selected' : ''}>${data.personas[key].name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="relative">
                    <label class="label">
                        <span class="label-text">Icon</span>
                    </label>
                    <!-- Search Input -->
                    <input type="text" class="input input-bordered step-icon-search w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Search Icon" />
                    
                    <!-- Icon Dropdown -->
                    <div class="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-10 max-h-60 overflow-y-auto hidden icon-dropdown">
                        ${iconItems}
                    </div>
                </div>
            </div>
            <div class="mt-4">
                <label class="label">
                    <span class="label-text dark:text-white">URLs</span>
                </label>
                <div class="urls-container space-y-2">
                    ${urls.map(url => `
                        <div class="flex space-x-2 items-center">
                            <input type="url" class="input input-bordered step-url flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://example.com" value="${url}" required>
                            <button type="button" class="btn btn-sm btn-error removeUrl">🗑️</button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-sm btn-secondary mt-2 addUrl">Add URL</button>
            </div>
        `;

        // Handle Remove Step
        stepDiv.querySelector('.removeStep').addEventListener('click', () => {
            stepsContainer.removeChild(stepDiv);
        });

        // Handle Add URL
        stepDiv.querySelector('.addUrl').addEventListener('click', () => {
            addUrlField(stepDiv.querySelector('.urls-container'));
        });

        // Handle Remove URL
        stepDiv.querySelectorAll('.removeUrl').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.parentElement.remove();
            });
        });

        // Handle Icon Selection (Search Functionality)
        const searchInput = stepDiv.querySelector('.step-icon-search');
        const iconDropdown = stepDiv.querySelector('.icon-dropdown');

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const icons = iconDropdown.querySelectorAll('.icon-item');
            icons.forEach(icon => {
                const iconName = icon.getAttribute('data-icon').toLowerCase();
                if (iconName.includes(query)) {
                    icon.style.display = 'flex';
                } else {
                    icon.style.display = 'none';
                }
            });
        });

        iconDropdown.querySelectorAll('.icon-item').forEach(iconItem => {
            iconItem.addEventListener('click', () => {
                const selectedIcon = iconItem.getAttribute('data-icon');
                // Update the icon input value or display as needed
                // For example, you can set it to a hidden input or display the icon name
                // Assuming you have a hidden input to store the selected icon
                let hiddenInput = stepDiv.querySelector('.selected-icon');
                if (!hiddenInput) {
                    hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.className = 'selected-icon';
                    stepDiv.appendChild(hiddenInput);
                }
                hiddenInput.value = selectedIcon;
                // Optionally, display the selected icon
                const iconDisplay = stepDiv.querySelector('.icon-display');
                if (iconDisplay) {
                    iconDisplay.textContent = selectedIcon;
                }
                iconDropdown.classList.add('hidden');
            });
        });

        searchInput.addEventListener('focus', () => {
            iconDropdown.classList.remove('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!stepDiv.contains(e.target)) {
                iconDropdown.classList.add('hidden');
            }
        });

        stepsContainer.appendChild(stepDiv);
    }

    // Function to Add URL Fields
    function addUrlField(container, url = '') {
        const urlDiv = document.createElement('div');
        urlDiv.className = 'flex space-x-2 items-center';

        urlDiv.innerHTML = `
            <input type="url" class="input input-bordered step-url flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://example.com" value="${url}" required>
            <button type="button" class="btn btn-sm btn-error removeUrl">🗑️</button>
        `;

        // Handle Remove URL
        urlDiv.querySelector('.removeUrl').addEventListener('click', () => {
            container.removeChild(urlDiv);
        });

        container.appendChild(urlDiv);
    }
});