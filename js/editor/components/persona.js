export function createPersonaField(key = '', persona = {}) {
    const personaDiv = document.createElement('div');
    personaDiv.className = 'persona flex space-x-4 items-center';
    personaDiv.innerHTML = `
        <input type="text" class="input input-bordered persona-key w-24" placeholder="Key" value="${key}" required>
        <input type="text" class="input input-bordered persona-display-name flex-1" placeholder="Name" value="${persona.name || ''}" required>
        <input type="text" class="input input-bordered persona-title w-32" placeholder="Title" value="${persona.title || ''}" required>
        <input type="text" class="input input-bordered persona-picture flex-1" placeholder="Picture URL" value="${persona.pictureurl || ''}">
        <img class="w-10 h-10 object-cover rounded" src="/pictures/${persona.pictureurl || ''}" alt="Preview" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23eee%22/></svg>'">
        <button type="button" class="btn btn-sm btn-error removePersona">🗑️</button>
    `;

    // Add event listener for picture URL updates
    const pictureInput = personaDiv.querySelector('.persona-picture');
    const picturePreview = personaDiv.querySelector('img');
    pictureInput.addEventListener('input', (e) => {
        picturePreview.src = "/pictures/"+e.target.value || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23eee%22/></svg>';
    });

    return personaDiv;
}