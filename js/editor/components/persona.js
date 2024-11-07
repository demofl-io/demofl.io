
export function createPersonaField(key = '', persona = {}) {
    const personaDiv = document.createElement('div');
    personaDiv.className = 'persona flex space-x-4 items-center';
    personaDiv.innerHTML = `
        <input type="text" class="input input-bordered persona-key w-24" placeholder="Key" value="${key}" required>
        <input type="text" class="input input-bordered persona-display-name flex-1" placeholder="Name" value="${persona.name || ''}" required>
        <input type="text" class="input input-bordered persona-title w-32" placeholder="Title" value="${persona.title || ''}" required>
        <input type="text" class="input input-bordered persona-picture flex-1" placeholder="Picture URL" value="${persona.pictureurl || ''}">
        <button type="button" class="btn btn-sm btn-error removePersona">🗑️</button>
    `;

    return personaDiv;
}