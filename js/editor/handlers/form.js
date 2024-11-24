import { saveTemplate } from '../../popup/templates.js';
import { getStoredImage, uploadImage } from '../utils/images.js';

export function initFormHandler(form, data) {
    // First populate the form with existing data
    populateFormData(form, data.data);

    // Then add the submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const template = await collectFormData(form);
        await handleFormSubmit(template, data.name, data.type);
    });

    // Initialize logo selectors
    initLogoSelector(form.querySelector('#product .custom-select'), '#productLogo');
    initLogoSelector(form.querySelector('#customer .custom-select'), '#customerLogo');

    // Initialize logo upload handlers
    initLogoUploader(form.querySelector('.product-logo-upload'), '#product .custom-select');
    initLogoUploader(form.querySelector('.customer-logo-upload'), '#customer .custom-select');
}

function initLogoSelector(customSelect, hiddenInputSelector) {
    const selectButton = customSelect.querySelector('button');
    const dropdownOptions = customSelect.querySelector('.dropdown-options');
    const hiddenInput = customSelect.closest('form').querySelector(hiddenInputSelector);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            dropdownOptions.classList.add('hidden');
        }
    });

    // Toggle dropdown
    selectButton.addEventListener('click', () => {
        dropdownOptions.classList.toggle('hidden');
        loadAvailableLogos(dropdownOptions, selectButton, hiddenInput);
    });
}

async function loadAvailableLogos(dropdownOptions, selectButton, hiddenInput) {
    const storage = await chrome.storage.local.get(null);
    const storedLogos = Object.keys(storage).filter(key => 
        key.startsWith('logo_') && 
        !key.endsWith('_displayName')
    );

    // Clear existing options (except the first one)
    dropdownOptions.innerHTML = `
        <div class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2" data-value="">
            <div class="w-8 h-8 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <span class="dark:text-gray-200">Select logo...</span>
        </div>
    `;

    // Add stored logos
    for (const logo of storedLogos) {
        const option = document.createElement('div');
        option.className = 'p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2';
        option.dataset.value = logo;
        option.innerHTML = `
            <img class="w-8 h-8 object-contain rounded" src="${storage[logo]}" alt="Preview">
            <span class="dark:text-gray-200">${storage[`${logo}_displayName`] || logo.replace(/^logo_\d+_/, '')}</span>
        `;
        
        option.addEventListener('click', async () => {
            hiddenInput.value = logo;
            selectButton.innerHTML = `
                <img class="w-6 h-6 object-contain rounded" src="${storage[logo]}" alt="Selected">
                <span class="flex-1 text-left truncate dark:text-gray-200">${storage[`${logo}_displayName`] || logo.replace(/^logo_\d+_/, '')}</span>
                <span class="arrow">▼</span>
            `;
            dropdownOptions.classList.add('hidden');
        });
        
        dropdownOptions.appendChild(option);
    }
}

function initLogoUploader(fileInput, customSelectSelector) {
    fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            const result = await uploadImage(e.target.files[0], 'logo');
            const customSelect = fileInput.closest('form').querySelector(customSelectSelector);
            const dropdownOptions = customSelect.querySelector('.dropdown-options');
            const selectButton = customSelect.querySelector('button');
            const hiddenInput = customSelect.closest('div').querySelector('input[type="hidden"]');
            
            // Refresh the dropdown and select the new logo
            await loadAvailableLogos(dropdownOptions, selectButton, hiddenInput);
            const newOption = dropdownOptions.querySelector(`[data-value="${result.id}"]`);
            if (newOption) {
                newOption.click();
            }
        }
    });
}

async function populateFormData(form, data) {
    // Theme data
    form.querySelector('#brandColor').value = data.theme['brand-color'] || '#000000';
    form.querySelector('#overlayColor').value = data.theme['overlay-color'] || '#ffffff';
    form.querySelector('#overlayBackground').value = data.theme['overlay-background'] || '#111827';
    form.querySelector('#brandFont').value = data.theme['brand-font'] || 'Arial';
    form.querySelector('#overlayH').value = data.theme['overlay-h'] || 'center';
    form.querySelector('#overlayV').value = data.theme['overlay-v'] || 'top';
    form.querySelector('#overlayScale').value = data.theme['overlay-scale'] || '100%';

    // Product data
    form.querySelector('#productName').value = data.product?.name || '';
    form.querySelector('#productLogo').value = data.product?.logourl || '';
    await initializeLogoSelect(
        form.querySelector('#product .custom-select'),
        data.product?.logourl
    );

    // Customer data
    form.querySelector('#customerName').value = data.customer?.name || '';
    form.querySelector('#customerLogo').value = data.customer?.logourl || '';
    await initializeLogoSelect(
        form.querySelector('#customer .custom-select'),
        data.customer?.logourl
    );

    // Load logo previews
    loadLogoPreview(form.querySelector('#productLogo'), '.product-logo-preview');
    loadLogoPreview(form.querySelector('#customerLogo'), '.customer-logo-preview');

    // Note: Personas and Steps are handled by initializeComponents in index.js
}

async function initializeLogoSelect(customSelect, logoId) {
    if (!logoId) return;

    const selectButton = customSelect.querySelector('button');
    const storage = await chrome.storage.local.get([logoId, `${logoId}_displayName`]);
    
    if (storage[logoId]) {
        selectButton.innerHTML = `
            <img class="w-6 h-6 object-contain rounded" src="${storage[logoId]}" alt="Selected">
            <span class="flex-1 text-left truncate dark:text-gray-200">${storage[`${logoId}_displayName`] || logoId.replace(/^logo_\d+_/, '')}</span>
            <span class="arrow">▼</span>
        `;
    }
}

async function loadLogoPreview(input, previewSelector) {
    const logoId = input.value;
    if (logoId) {
        const imageData = await getStoredImage(logoId);
        if (imageData) {
            const preview = input.parentElement.querySelector(previewSelector);
            if (preview) {
                preview.src = imageData;
            }
        }
    }
}

async function collectFormData(form) {
    // Gather Theme Data
    const theme = {
        'brand-color': form.querySelector('#brandColor').value,
        'overlay-color': form.querySelector('#overlayColor').value,
        'overlay-background': form.querySelector('#overlayBackground').value,
        'brand-font': form.querySelector('#brandFont').value,
        'overlay-h': form.querySelector('#overlayH').value,
        'overlay-v': form.querySelector('#overlayV').value,
        'overlay-scale': form.querySelector('#overlayScale').value
    };

    // Gather Product Data
    const product = {
        name: form.querySelector('#productName').value,
        logourl: form.querySelector('#productLogo').value
    };

    // Gather Customer Data
    const customer = {
        name: form.querySelector('#customerName').value,
        logourl: form.querySelector('#customerLogo').value
    };

    // Gather Personas Data
    const personasElements = form.querySelector('#personasContainer').querySelectorAll('.persona');
    const personas = {};
    personasElements.forEach(personaEl => {
        const key = personaEl.querySelector('.persona-key')?.value.trim();
        const name = personaEl.querySelector('.persona-display-name')?.value.trim();
        const title = personaEl.querySelector('.persona-title')?.value.trim();
        const pictureurl = personaEl.querySelector('.persona-picture')?.value.trim();
        
        // Collect fake texts
        const fakeText = Array.from(personaEl.querySelectorAll('.fake-text'))
            .map(input => input.value.trim())
            .filter(text => text);

        if (key && name && title) {
            personas[key] = { name, title, pictureurl, fakeText };
        }
    });

    // Gather Steps Data
    const stepsElements = form.querySelector('#stepsContainer').querySelectorAll('.step');
    console.log('Found steps elements:', stepsElements.length);
    
    const steps = [];
    stepsElements.forEach((stepEl, index) => {
        const title = stepEl.querySelector('.step-title')?.value?.trim();
        const description = stepEl.querySelector('.step-description')?.value?.trim();
        const personaKey = stepEl.querySelector('.selected-persona')?.value;
        const icon = stepEl.querySelector('.selected-icon')?.value;
        const tabColor = stepEl.querySelector('.step-tab-color')?.value || 'green';
        
        const urls = Array.from(stepEl.querySelectorAll('.step-url'))
            .map(input => input.value.trim())
            .filter(url => url);

        if (title) {
            steps.push({
                title,
                description: description || '',
                urls: urls || [],
                persona: personaKey || '',
                icon: icon || '',
                tabColor: tabColor // Ensure tabColor is included in the step data
            });
        }
    });

    return {
        theme,
        product,
        customer,
        personas,
        steps
    };
}

async function handleFormSubmit(template, name, type) {
    // Validate steps have icons
    const missingIcons = template.steps.filter(step => !step.icon);
    if (missingIcons.length > 0) {
        alert(`Please select an icon for all steps`);
        return false;
    }

    // Save the template
    const saveSuccess = await saveTemplate(template, name, type);
    if (saveSuccess) {
        alert('Template saved successfully.');
        // Clear the editingTemplate from storage
        await chrome.storage.local.remove('editingTemplate');

        window.close();
        return true;
    } else {
        alert('Failed to save the template. Please check the console for errors.');
        return false;
    }
}