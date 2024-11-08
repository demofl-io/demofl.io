function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function generateIconItems(formattedIcons) {
    // Create a container div instead of generating all HTML at once
    return '<div class="icons-virtual-list" style="height: 300px; overflow-y: auto;"></div>';
}

function renderVisibleIcons(container, formattedIcons, searchQuery = '') {
    const itemHeight = 40; // approximate height of each icon item
    const containerHeight = container.clientHeight;
    const scrollTop = container.scrollTop;
    
    const filteredIcons = searchQuery 
        ? formattedIcons.filter(icon => 
            icon.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
            icon.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : formattedIcons;

    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(startIndex + visibleItems + 5, filteredIcons.length); // +5 for buffer

    const content = filteredIcons
        .slice(startIndex, endIndex)
        .map(iconObj => `
            <div class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer icon-item" 
                 data-icon="${iconObj.value}"
                 style="height: ${itemHeight}px;">
                <span class="${iconObj.class} mr-2 dark:text-white">${iconObj.value}</span>
                <span class="dark:text-white">${iconObj.name}</span>
            </div>
        `).join('');

    container.innerHTML = `
        <div style="height: ${filteredIcons.length * itemHeight}px; position: relative;">
            <div style="position: absolute; top: ${startIndex * itemHeight}px; width: 100%;">
                ${content}
            </div>
        </div>
    `;

    // Reattach click handlers to visible items
    container.querySelectorAll('.icon-item').forEach(iconItem => {
        attachIconItemHandler(iconItem);
    });
}

function attachIconItemHandler(iconItem) {
    iconItem.addEventListener('click', () => {
        const stepDiv = iconItem.closest('.step');
        const selectedIcon = iconItem.getAttribute('data-icon');
        const iconClass = iconItem.querySelector('span').className;
        
        const hiddenInput = stepDiv.querySelector('.selected-icon');
        const preview = stepDiv.querySelector('.selected-icon-preview');
        const searchInput = stepDiv.querySelector('.step-icon-search');
        const iconDropdown = stepDiv.querySelector('.icon-dropdown');
        
        hiddenInput.value = selectedIcon;
        preview.className = `selected-icon-preview ${iconClass}`;
        preview.textContent = selectedIcon;
        searchInput.value = selectedIcon;
        iconDropdown.classList.add('hidden');
    });
}

function generatePersonaOptions(personas, selectedPersona) {
    return Object.entries(personas).map(([key, persona]) => `
        <div class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2 persona-option" data-value="${key}">
            <img class="w-8 h-8 object-cover rounded" src="" alt="" data-picture-id="${persona.pictureurl || ''}">
            <span class="dark:text-gray-200">${persona.title}</span>
        </div>
    `).join('');
}

export function createStepField(title = '', description = '', urls = [], persona = '', icon = '', formattedIcons, personas) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step p-4 border border-gray-300 rounded-lg';
    const iconItems = generateIconItems(formattedIcons);
    const personaOptions = generatePersonaOptions(personas, persona);
    
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
                <input type="text" class="input input-bordered step-title w-full" value="${title}">
            </div>
            <div>
                <label class="label">
                    <span class="label-text">Description</span>
                </label>
                <textarea class="textarea textarea-bordered step-description w-full">${description}</textarea>
            </div>
            <div>
                <label class="label">
                    <span class="label-text">Persona</span>
                </label>
                <div class="custom-select relative w-full">
                    <button type="button" class="select select-bordered w-full flex items-center space-x-2">
                        <img class="w-6 h-6 object-cover rounded selected-persona-img" src="" alt="">
                        <span class="flex-1 text-left selected-persona-name">${persona ? personas[persona]?.title : 'Select Persona...'}</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="persona-dropdown hidden absolute left-0 top-full w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50">
                        ${personaOptions}
                    </div>
                    <input type="hidden" class="selected-persona" value="${persona}">
                </div>
            </div>
            <div>
                <label class="label">
                    <span class="label-text">Icon</span>
                </label>
                <div class="flex space-x-2 relative">
                    <div class="w-10 h-10 flex items-center justify-center border rounded-lg">
                        <span class="selected-icon-preview material-icons">${icon}</span>
                    </div>
                    <div class="flex-1">
                        <input type="text" class="input input-bordered step-icon-search w-full" value="${icon}">
                    </div>
                    <div class="icon-dropdown hidden absolute left-0 top-full w-full mt-1 border rounded-lg bg-white dark:bg-gray-800 shadow-lg z-50 max-h-60 overflow-y-auto">
                        ${iconItems}
                    </div>
                    <input type="hidden" class="selected-icon" value="${icon}">
                </div>
            </div>
        </div>
        <div class="mt-4">
            <label class="label">
                <span class="label-text">URLs</span>
            </label>
            <div class="urls-container space-y-2">
                ${urls.map(url => `
                    <div class="flex space-x-2 items-center">
                        <input type="url" class="input input-bordered step-url flex-1" value="${url}">
                        <button type="button" class="btn btn-sm btn-error removeUrl">🗑️</button>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="btn btn-sm btn-secondary mt-2 addUrl">Add URL</button>
        </div>
    `;

    // Add remove URL button handlers
    stepDiv.querySelectorAll('.removeUrl').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.flex').remove();
        });
    });

    // Add URL button handler
    stepDiv.querySelector('.addUrl').addEventListener('click', () => {
        const urlsContainer = stepDiv.querySelector('.urls-container');
        const urlDiv = document.createElement('div');
        urlDiv.className = 'flex space-x-2 items-center';
        urlDiv.innerHTML = `
            <input type="url" class="input input-bordered step-url flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://example.com" required>
            <button type="button" class="btn btn-sm btn-error removeUrl">🗑️</button>
        `;
        
        urlDiv.querySelector('.removeUrl').addEventListener('click', function() {
            urlsContainer.removeChild(urlDiv);
        });
        
        urlsContainer.appendChild(urlDiv);
    });

    // Add remove step button handler
    stepDiv.querySelector('.removeStep').addEventListener('click', () => {
        stepDiv.remove();
    });

    // Handle Icon Selection (Search Functionality)
    const searchInput = stepDiv.querySelector('.step-icon-search');
    const iconDropdown = stepDiv.querySelector('.icon-dropdown');
    const iconContainer = stepDiv.querySelector('.flex.space-x-2.relative');
    const virtualList = iconDropdown.querySelector('.icons-virtual-list');

    // Initial render of visible icons
    renderVisibleIcons(virtualList, formattedIcons);

    // Debounced search handler
    const debouncedSearch = debounce((query) => {
        renderVisibleIcons(virtualList, formattedIcons, query);
    }, 150);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    virtualList.addEventListener('scroll', () => {
        renderVisibleIcons(virtualList, formattedIcons, searchInput.value);
    });

    searchInput.addEventListener('focus', () => {
        iconDropdown.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!iconContainer.contains(e.target)) {
            iconDropdown.classList.add('hidden');
        }
    });

    // Add event handlers for persona selector
    const personaSelect = stepDiv.querySelector('.custom-select');
    const personaButton = personaSelect.querySelector('button');
    const personaDropdown = personaSelect.querySelector('.persona-dropdown');
    const personaInput = personaSelect.querySelector('.selected-persona');
    const selectedImg = personaSelect.querySelector('.selected-persona-img');

    // Load initial persona picture if exists
    if (persona && personas[persona]?.pictureurl) {
        chrome.storage.local.get(personas[persona].pictureurl).then(result => {
            if (result[personas[persona].pictureurl]) {
                selectedImg.src = result[personas[persona].pictureurl];
            }
        });
    }

    // Load all persona pictures in dropdown
    personaDropdown.querySelectorAll('img[data-picture-id]').forEach(img => {
        const pictureId = img.dataset.pictureId;
        if (pictureId) {
            chrome.storage.local.get(pictureId).then(result => {
                if (result[pictureId]) {
                    img.src = result[pictureId];
                }
            });
        }
    });

    // Toggle dropdown
    personaButton.addEventListener('click', () => {
        personaDropdown.classList.toggle('hidden');
    });

    // Handle selection
    personaDropdown.querySelectorAll('.persona-option').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.dataset.value;
            const img = option.querySelector('img');
            const name = option.querySelector('span').textContent;
            
            personaInput.value = value;
            selectedImg.src = img.src;
            personaButton.querySelector('.selected-persona-name').textContent = name;
            personaDropdown.classList.add('hidden');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!personaSelect.contains(e.target)) {
            personaDropdown.classList.add('hidden');
        }
    });

    // Add error handlers for all images
    stepDiv.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 fill=%22%23eee%22/>';
        });
    });

    return stepDiv;
}