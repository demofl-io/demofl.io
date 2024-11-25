
// js/utils/theme.js
export function initializeTheme() {
    let lightTheme = 'lofi';
    let darkTheme = 'business';
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === lightTheme ? darkTheme : lightTheme;
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
    }

    themeToggleBtn.addEventListener('click', toggleTheme);

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || darkTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (savedTheme === lightTheme) {
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    } else {
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    }
}