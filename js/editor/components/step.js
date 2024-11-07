function generateIconItems(formattedIcons) {
    return formattedIcons.map(iconObj => `
        <div class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer icon-item" data-icon="${iconObj.value}">
            <span class="${iconObj.class} mr-2 dark:text-white">${iconObj.value}</span>
            <span class="dark:text-white">${iconObj.name}</span>
        </div>
    `).join('');
}

function generatePersonaOptions(personas, selectedPersona) {
    return Object.entries(personas).map(([key, persona]) => `
        <option value="${key}" ${selectedPersona === key ? 'selected' : ''}>${persona.name}</option>
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
                    ${personaOptions}
                </select>
            </div>
                <div class="relative">
                    <label class="label">
                        <span class="label-text">Icon</span>
                    </label>
                    <!-- Search Input -->
                    <input type="text" class="input input-bordered step-icon-search w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Search Icon" value="${icon}"/>
                    
                    <!-- Icon Dropdown -->
                    <div class="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-10 max-h-60 overflow-y-auto hidden icon-dropdown">
                        ${iconItems}
                    </div>
                    
                    <!-- Hidden Input to Store Selected Icon -->
                    <input type="hidden" class="selected-icon" value="${icon}">
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


        // Handle Icon Selection (Search Functionality)
        const searchInput = stepDiv.querySelector('.step-icon-search');
        const iconDropdown = stepDiv.querySelector('.icon-dropdown');

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const icons = iconDropdown.querySelectorAll('.icon-item');
            icons.forEach(iconItem => {
                const iconName = iconItem.getAttribute('data-icon').toLowerCase();
                if (iconName.includes(query)) {
                    iconItem.style.display = 'flex';
                } else {
                    iconItem.style.display = 'none';
                }
            });
        });

        iconDropdown.querySelectorAll('.icon-item').forEach(iconItem => {
            iconItem.addEventListener('click', () => {
                const selectedIcon = iconItem.getAttribute('data-icon');
                // Update the hidden input value
                const hiddenInput = stepDiv.querySelector('.selected-icon');
                hiddenInput.value = selectedIcon;
                
                // Optionally, update the search input to show the selected icon
                searchInput.value = selectedIcon;
                
                // Hide the dropdown
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


    return stepDiv;
}