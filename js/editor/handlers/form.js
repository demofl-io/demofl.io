import { saveTemplate } from '../../popup/templates.js';

export function initFormHandler(form, data) {
    // First populate the form with existing data
    populateFormData(form, data.data);

    // Then add the submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const template = await collectFormData(form);
        await handleFormSubmit(template, data.name, data.type);
    });
}

function populateFormData(form, data) {
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

    // Customer data
    form.querySelector('#customerName').value = data.customer?.name || '';
    form.querySelector('#customerLogo').value = data.customer?.logourl || '';

    // Note: Personas and Steps are handled by initializeComponents in index.js
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

        if (key && name && title) {
            personas[key] = { name, title, pictureurl };
        }
    });

    // Gather Steps Data
    const stepsElements = form.querySelector('#stepsContainer').querySelectorAll('.step');
    const steps = [];
    stepsElements.forEach(stepEl => {
        const title = stepEl.querySelector('.step-title')?.value.trim();
        const description = stepEl.querySelector('.step-description')?.value.trim();
        const personaKey = stepEl.querySelector('.step-persona')?.value;
        const icon = stepEl.querySelector('.selected-icon')?.value;
        const urls = Array.from(stepEl.querySelectorAll('.step-url'))
            .map(input => input.value.trim())
            .filter(url => url);

        if (title && description && personaKey && icon && urls.length > 0) {
            steps.push({
                title,
                description,
                urls,
                persona: personaKey,
                icon,
                incognito: stepEl.querySelector('.step-incognito')?.checked || false,
                onlyShowUrls: stepEl.querySelector('.step-only-show-urls')?.checked || false
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