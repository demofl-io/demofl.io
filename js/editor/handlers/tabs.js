export function initTabHandlers() {
    const tabs = document.querySelectorAll('.tabs .tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('tab-active'));
            contents.forEach(c => c.classList.add('hidden'));
            tab.classList.add('tab-active');
            
            const target = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(target);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
}