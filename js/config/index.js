import { uploadImage, getStoredImage } from '../editor/utils/images.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadLogos();
    initializeUploader();
});

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
                <button class="logo-delete btn btn-circle btn-sm btn-ghost hover:btn-error" data-logo="${logoKey}">
                    <span class="material-icons text-base">delete</span>
                </button>
            ` : ''}
        `;

        if (!logoKey.includes('default_')) {
            item.querySelector('.logo-delete').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${displayName}"?`)) {
                    await deleteLogo(logoKey);
                }
            });
        }

        logoGrid.appendChild(item);
    }
}

function initializeUploader() {
    const fileInput = document.getElementById('logoUpload');
    fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            await uploadImage(e.target.files[0], 'logo');
            await loadLogos();
        }
    });
}

async function deleteLogo(logoKey) {
    console.log('Deleting logo:', logoKey);
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