
export async function getStoredImage(imageId) {
    if (!imageId) return null;
    const result = await chrome.storage.local.get(imageId);
    return result[imageId] || null;
}

export async function uploadImage(file, prefix = 'image') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const customName = await promptForImageName(
                file.name.replace(/\.[^/.]+$/, '')
            );
            
            const fileName = `${prefix}_${Date.now()}_${customName}`;
            const imageData = event.target.result;
            
            await chrome.storage.local.set({
                [fileName]: imageData,
                [`${fileName}_displayName`]: customName
            });
            
            resolve({
                id: fileName,
                url: imageData,
                displayName: customName
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function promptForImageName(defaultName) {
    const name = window.prompt('Enter a name for this image:', defaultName);
    return name ? name.trim() : defaultName;
}