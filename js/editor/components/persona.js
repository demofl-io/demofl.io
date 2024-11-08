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
        <select class="select select-bordered persona-picture-select w-40">
            <option value="">Select picture...</option>
        </select>
        <input type="text" class="input input-bordered persona-picture flex-1" placeholder="Picture URL" value="${persona.pictureurl || ''}" readonly>
        <label class="btn btn-sm btn-secondary">
            📤
            <input type="file" class="hidden persona-upload" accept="image/*">
        </label>
        <img class="w-10 h-10 object-cover rounded" src="" alt="Preview" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 fill=%22%23eee%22/></svg>'">
        <button type="button" class="btn btn-sm btn-error removePersona">🗑️</button>
    `;

    const pictureInput = personaDiv.querySelector('.persona-picture');
    const pictureSelect = personaDiv.querySelector('.persona-picture-select');
    const picturePreview = personaDiv.querySelector('img');
    const fileInput = personaDiv.querySelector('.persona-upload');

    // Function to populate picture select dropdown
    async function loadAvailablePictures() {
        // Get pictures from storage
        const storage = await chrome.storage.local.get(null);
        const storedPictures = Object.keys(storage).filter(key => 
            (key.startsWith('persona_') || key.startsWith('default_')) && 
            !key.endsWith('_displayName')
        );

        // Clear existing options (except the first one)
        pictureSelect.innerHTML = '<option value="">Select picture...</option>';

        // Add stored pictures with custom names
        for (const pic of storedPictures) {
            const option = document.createElement('option');
            option.value = pic;
            // Use custom display name if available
            option.textContent = storage[`${pic}_displayName`] || 
                               pic.replace(/^(persona_\d+_|default_)/, '');
            pictureSelect.appendChild(option);
        }

        // Select current picture if exists
        if (persona.pictureurl) {
            pictureSelect.value = persona.pictureurl;
        }
    }

    // Handle picture selection
    pictureSelect.addEventListener('change', async (e) => {
        const selectedPicture = e.target.value;
        pictureInput.value = selectedPicture;
        
        if (selectedPicture) {
            const result = await chrome.storage.local.get(selectedPicture);
            picturePreview.src = result[selectedPicture];
        } else {
            picturePreview.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23eee%22/></svg>';
        }
    });

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