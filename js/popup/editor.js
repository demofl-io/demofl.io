// js/popup/editor.js
import { saveTemplate } from './templates.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('editForm');
    const addPersonaBtn = document.getElementById('addPersonaBtn');
    const personasContainer = document.getElementById('personasContainer');
    const addStepBtn = document.getElementById('addStepBtn');
    const stepsContainer = document.getElementById('stepsContainer');

    // Define available Material Icons
    const availableIcons = [
        { name: 'Description', value: 'description', class: 'material-icons' },
        { name: 'Assessment', value: 'assessment', class: 'material-icons' },
        { name: 'Build', value: 'build', class: 'material-icons' },
        { name: 'Search', value: 'search', class: 'material-icons' },
        { name: 'TrendingUp', value: 'trending_up', class: 'material-icons' },
        // Add more icons as needed
    ];

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
    const personas = data.personnas || {};
    for (const [key, persona] of Object.entries(personas)) {
        addPersonaField(key, persona); // Pass both key and persona
    }

    // Populate Steps
    const steps = data.steps || [];
    steps.forEach((step, index) => {
        addStepField(step.title || '', step.description || '', step.urls || [], step.personna || '', step.icon || '');
    });

    // Handle Add Persona
    addPersonaBtn.addEventListener('click', () => {
        addPersonaField();
    });

    // Handle Add Step
    addStepBtn.addEventListener('click', () => {
        addStepField();
    });

    // Handle Form Submission
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

        // Gather Personas Data
        const personasElements = personasContainer.querySelectorAll('.persona');
        const personnas = {};
        personasElements.forEach(personaEl => {
            const key = personaEl.querySelector('.persona-key').value.trim();
            const name = personaEl.querySelector('.persona-display-name').value.trim();
            const title = personaEl.querySelector('.persona-title').value.trim();
            const pictureurl = personaEl.querySelector('.persona-picture').value.trim();
            if (key && name && title) {
                personnas[key] = { name, title, pictureurl };
            }
        });

        // Gather Steps Data
        const stepsElements = stepsContainer.querySelectorAll('.step');
        const steps = [];
        stepsElements.forEach(stepEl => {
            const title = stepEl.querySelector('.step-title').value.trim();
            const description = stepEl.querySelector('.step-description').value.trim();
            const personaKey = stepEl.querySelector('.step-persona').value;
            const icon = stepEl.querySelector('.step-icon').value;
            const urls = Array.from(stepEl.querySelectorAll('.step-url'))
                .map(input => input.value.trim())
                .filter(url => url);
            if (title && description && personaKey && icon && urls.length > 0) {
                steps.push({ title, description, urls, personna: personaKey, icon });
            }
        });

        // Construct the updated template
        const updatedTemplate = {
            theme,
            product,
            customer,
            personnas,
            steps
        };

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

    // Function to Add Step Fields
    function addStepField(title = '', description = '', urls = [], personna = '', icon = '') {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step p-4 border border-gray-300 rounded-lg';

        // Generate Persona Options
        const personaOptions = Object.keys(data.personnas).map(key => `
            <option value="${key}" ${personna === key ? 'selected' : ''}>${data.personnas[key].name}</option>
        `).join('');

        // Generate Material Icon Options
        const iconOptions = availableIcons.map(iconOption => `
            <option value="${iconOption.value}" ${icon === iconOption.value ? 'selected' : ''}>${iconOption.name}</option>
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
                    <div class="flex items-center">
                        <input type="text" class="input input-bordered step-title w-full" placeholder="Step Title" value="${title}" required>

                    </div>
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
                        <option value="" disabled>Select Persona</option>
                        ${personaOptions}
                    </select>
                </div>
                <div>
                    <label class="label">
                        <span class="label-text">Icon</span>
                    </label>
                    <select class="select select-bordered step-icon w-full" required>
                        <option value="" disabled>Select Icon</option>
                        ${iconOptions}
                    </select>
                         <span class="material-icons md-24 icon-preview ml-2">
                            ${icon ? icon : 'help_outline'}
                        </span>
                </div>
            </div>
            <div class="mt-4">
                <label class="label">
                    <span class="label-text">URLs</span>
                </label>
                <div class="urls-container space-y-2">
                    ${urls.map(url => `
                        <div class="flex space-x-2 items-center">
                            <input type="url" class="input input-bordered step-url flex-1" placeholder="https://example.com" value="${url}" required>
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

        // Update Icon Preview on Change
        const iconSelect = stepDiv.querySelector('.step-icon');
        const iconPreview = stepDiv.querySelector('.icon-preview');

        iconSelect.addEventListener('change', (e) => {
            iconPreview.textContent = e.target.value || 'help_outline';
        });

        stepsContainer.appendChild(stepDiv);
    }

    // Function to Add URL Fields
    function addUrlField(container, url = '') {
        const urlDiv = document.createElement('div');
        urlDiv.className = 'flex space-x-2 items-center';

        urlDiv.innerHTML = `
            <input type="url" class="input input-bordered step-url flex-1" placeholder="https://example.com" value="${url}" required>
            <button type="button" class="btn btn-sm btn-error removeUrl">🗑️</button>
        `;

        // Handle Remove URL
        urlDiv.querySelector('.removeUrl').addEventListener('click', () => {
            container.removeChild(urlDiv);
        });

        container.appendChild(urlDiv);
    }
});