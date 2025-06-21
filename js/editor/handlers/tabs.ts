// js/editor/handlers/tabs.ts
export function initTabHandlers(): void {
    const tabs = document.querySelectorAll('.tabs .tab');
    const contents = document.querySelectorAll('.tab-content');

    // Initial state - hide all content except the first tab
    contents.forEach((content, index) => {
        (content as HTMLElement).style.display = index === 0 ? 'block' : 'none';
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('tab-active'));
            
            // Hide all tab contents
            contents.forEach(c => {
                (c as HTMLElement).style.display = 'none';
            });
            
            // Add active class to clicked tab
            tab.classList.add('tab-active');
            
            // Show the corresponding content
            const target = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(target);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
}