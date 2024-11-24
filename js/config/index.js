import { uploadImage, getStoredImage } from '../editor/utils/images.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadAssets();
    initializeUploaders();
    initializeTabs();
});

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('tab-active'));
            tab.classList.add('tab-active');
            
            const tabId = tab.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${tabId}Tab`).classList.remove('hidden');
        });
    });
}

async function loadAssets() {
    await Promise.all([
        loadLogos(),
        loadPersonaPictures()
    ]);
}

async function loadLogos() {
    const storage = await chrome.storage.local.get(null);
    const logoGrid = document.getElementById('logoGrid');
    logoGrid.innerHTML = '';

    const logoKeys = Object.keys(storage).filter(key => 
        key.startsWith('logo_') && 
        !key.endsWith('_displayName')
    );

    for (const logoKey of logoKeys) {
        const displayName = storage[`${logoKey}_displayName`] || logoKey.replace(/^logo_/, '');
        const logoUrl = storage[logoKey];
        
        const item = document.createElement('div');
        item.className = 'logo-item';
        item.innerHTML = `
            <img src="${logoUrl}" alt="${displayName}" class="logo-preview">
            <div class="flex justify-between items-center">
                <span class="font-medium">${displayName}</span>
            </div>
            ${!logoKey.includes('default_') ? `
                <button class="delete-btn btn btn-circle btn-sm btn-ghost hover:btn-error" data-logo="${logoKey}">
                    <span class="material-icons text-base">delete</span>
                </button>
            ` : ''}
        `;

        if (!logoKey.includes('default_')) {
            item.querySelector('.delete-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${displayName}"?`)) {
                    await deleteLogo(logoKey);
                }
            });
        }

        logoGrid.appendChild(item);
    }
}

async function loadPersonaPictures() {
    const storage = await chrome.storage.local.get(null);
    const personaGrid = document.getElementById('personaGrid');
    personaGrid.innerHTML = '';

    const pictureKeys = Object.keys(storage).filter(key => 
        (key.startsWith('persona_') || key.startsWith('default_')) && 
        !key.includes('logo_') &&
        !key.endsWith('_displayName')
    );

    for (const pictureKey of pictureKeys) {
        const displayName = storage[`${pictureKey}_displayName`] || pictureKey.replace(/^(persona_\d+_|default_)/, '');
        const pictureUrl = storage[pictureKey];
        
        const item = document.createElement('div');
        item.className = 'logo-item';
        item.innerHTML = `
            <img src="${pictureUrl}" alt="${displayName}" class="logo-preview">
            <div class="flex justify-between items-center">
                <span class="font-medium">${displayName}</span>
                ${pictureKey.startsWith('default_') ? '<span class="badge badge-sm">Default</span>' : ''}
            </div>
            ${!pictureKey.startsWith('default_') ? `
                <button class="delete-btn btn btn-circle btn-sm btn-ghost hover:btn-error" data-picture="${pictureKey}">
                    <span class="material-icons text-base">delete</span>
                </button>
            ` : ''}
        `;

        if (!pictureKey.startsWith('default_')) {
            item.querySelector('.delete-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${displayName}"?`)) {
                    await deletePersonaPicture(pictureKey);
                }
            });
        }

        personaGrid.appendChild(item);
    }
}

function initializeUploaders() {
    const logoInput = document.getElementById('logoUpload');
    logoInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            await uploadImage(e.target.files[0], 'logo');
            await loadLogos();
        }
    });

    const personaInput = document.getElementById('personaUpload');
    personaInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const name = prompt('Enter a name for this picture:', file.name.replace(/\.[^/.]+$/, ''));
            if (name) {
                const fileName = `persona_${Date.now()}_${name}`;
                await uploadImage(file, 'persona', fileName);
                await loadPersonaPictures();
            }
        }
    });
}

async function deletePersonaPicture(pictureKey) {
    try {
        await chrome.storage.local.remove([
            pictureKey,
            `${pictureKey}_displayName`
        ]);
        await loadPersonaPictures();
    } catch (error) {
        console.error('Error deleting persona picture:', error);
        alert('Failed to delete persona picture');
    }
}

async function deleteLogo(logoKey) {
    try {
        await chrome.storage.local.remove([
            logoKey,
            `${logoKey}_displayName`
        ]);
        await loadLogos();
    } catch (error) {
        console.error('Error deleting logo:', error);
        alert('Failed to delete logo');
    }
}