export async function getPersonaPicture(pictureId) {
    if (!pictureId) return null;
    const result = await chrome.storage.local.get(pictureId);
    return result[pictureId] || null;
}

export function createPersonaField(key = '', persona = {}) {
    const personaDiv = document.createElement('div');
    personaDiv.className = 'persona flex space-x-4 items-center';
    personaDiv.innerHTML = `
        <input type="text" class="input input-bordered persona-key w-24" placeholder="Key" value="${key}" required>
        <input type="text" class="input input-bordered persona-display-name flex-1" placeholder="Name" value="${persona.name || ''}" required>
        <input type="text" class="input input-bordered persona-title w-32" placeholder="Title" value="${persona.title || ''}" required>
        <div class="custom-select relative w-40">
            <button type="button" class="select select-bordered w-full flex items-center space-x-2">
                <span class="flex-1 text-left">Select picture...</span>
                <span class="arrow">▼</span>
            </button>
            <div class="dropdown-options hidden absolute left-0 top-full w-64 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2" data-value="">
                    <div class="w-8 h-8 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <span class="dark:text-gray-200">Select picture...</span>
                </div>
            </div>
        </div>
        <input type="hidden" class="input input-bordered persona-picture flex-1" placeholder="Picture URL" value="${persona.pictureurl || ''}" readonly>
        <label class="btn btn-sm">
            📤
            <input type="file" class="hidden persona-upload" accept="image/*">
        </label>
        <img class="w-10 h-10 object-cover rounded" src="" alt="Preview">
        <button type="button" class="btn btn-sm removePersona">🗑️</button>
    `;

    // Add error handler for preview image
    const previewImg = personaDiv.querySelector('img');
    previewImg.addEventListener('error', function() {
        this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 fill=%22%23eee%22/></svg>';
    });

    const pictureInput = personaDiv.querySelector('.persona-picture');
    const customSelect = personaDiv.querySelector('.custom-select');
    const selectButton = customSelect.querySelector('button');
    const dropdownOptions = customSelect.querySelector('.dropdown-options');
    const picturePreview = personaDiv.querySelector('img');
    const fileInput = personaDiv.querySelector('.persona-upload');

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            dropdownOptions.classList.add('hidden');
        }
    });

    // Toggle dropdown
    selectButton.addEventListener('click', () => {
        dropdownOptions.classList.toggle('hidden');
    });

    // Function to populate picture select dropdown
    async function loadAvailablePictures() {
        const storage = await chrome.storage.local.get(null);
        const storedPictures = Object.keys(storage).filter(key => 
            (key.startsWith('persona_') || key.startsWith('default_')) && 
            !key.endsWith('_displayName')
        );

        // Clear existing options (except the first one)
        dropdownOptions.innerHTML = `
            <div class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2" data-value="">
                <div class="w-8 h-8 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <span class="dark:text-gray-200">Select picture...</span>
            </div>
        `;

        // Add stored pictures with previews
        for (const pic of storedPictures) {
            const option = document.createElement('div');
            option.className = 'p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2';
            option.dataset.value = pic;
            option.innerHTML = `
                <img class="w-8 h-8 object-cover rounded" src="${storage[pic]}" alt="Preview">
                <span class="dark:text-gray-200">${storage[`${pic}_displayName`] || pic.replace(/^(persona_\d+_|default_)/, '')}</span>
            `;
            
            option.addEventListener('click', async () => {
                pictureInput.value = pic;
                picturePreview.src = storage[pic];
                selectButton.innerHTML = `
                    <img class="w-6 h-6 object-cover rounded" src="${storage[pic]}" alt="Selected">
                    <span class="flex-1 text-left truncate dark:text-gray-200">${storage[`${pic}_displayName`] || pic.replace(/^(persona_\d+_|default_)/, '')}</span>
                    <span class="arrow">▼</span>
                `;
                dropdownOptions.classList.add('hidden');
            });
            
            dropdownOptions.appendChild(option);
        }

        // Select current picture if exists
        if (persona.pictureurl && storage[persona.pictureurl]) {
            const selected = dropdownOptions.querySelector(`[data-value="${persona.pictureurl}"]`);
            if (selected) {
                selected.click();
            }
        }
    }

    async function promptForPictureName(defaultName) {
        const name = window.prompt('Enter a name for this picture:', defaultName);
        return name ? name.trim() : defaultName;
    }

    // Modify file upload handler to include name prompt
    fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                // Prompt for custom name
                const customName = await promptForPictureName(
                    file.name.replace(/\.[^/.]+$/, '') // Remove file extension
                );
                
                const fileName = `persona_${Date.now()}_${customName}`;
                const imageData = event.target.result;
                
                await chrome.storage.local.set({
                    [fileName]: imageData,
                    [`${fileName}_displayName`]: customName // Store display name separately
                });
                
                await loadAvailablePictures();
                pictureSelect.value = fileName;
                pictureInput.value = fileName;
                picturePreview.src = imageData;
            };
            
            reader.readAsDataURL(file);
        }
    });

    // Initial load of pictures
    loadAvailablePictures();

    // Initial load of image if exists
    if (persona.pictureurl) {
        chrome.storage.local.get(persona.pictureurl).then(result => {
            if (result[persona.pictureurl]) {
                picturePreview.src = result[persona.pictureurl];
            }
        });
    }

    return personaDiv;
}