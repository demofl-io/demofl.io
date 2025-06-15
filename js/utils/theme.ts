// js/utils/theme.ts
export function initializeTheme(container: HTMLElement | null = null): void {
    const lightTheme = 'lofi';
    const darkTheme = 'business';

    // Try to find existing theme toggle elements
    let themeToggleBtn = document.getElementById('theme-toggle');
    let sunIcon = document.getElementById('sun-icon');
    let moonIcon = document.getElementById('moon-icon');

    // If no existing elements and container provided, create new toggle
    if (!themeToggleBtn && container) {
        const themeToggle = document.createElement('div');
        themeToggle.className = 'fixed top-4 right-4 z-50';
        themeToggle.innerHTML = `
            <button class="btn btn-ghost btn-circle" id="theme-toggle">
                <svg id="sun-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                </svg>
                <svg id="moon-icon" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
            </button>
        `;
        container.appendChild(themeToggle);
        
        // Get the newly created elements
        themeToggleBtn = themeToggle.querySelector('#theme-toggle');
        sunIcon = themeToggle.querySelector('#sun-icon');
        moonIcon = themeToggle.querySelector('#moon-icon');
    }

    // If we have theme toggle elements, set up the functionality
    if (themeToggleBtn && sunIcon && moonIcon) {
        function toggleTheme(): void {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === lightTheme ? darkTheme : lightTheme;
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            sunIcon!.classList.toggle('hidden');
            moonIcon!.classList.toggle('hidden');
        }

        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || darkTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update icons if they exist
    if (sunIcon && moonIcon) {
        if (savedTheme === lightTheme) {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
    }
}