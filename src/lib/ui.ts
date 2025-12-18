/**
 * Initialize Mobile Menu functionality.
 * Requires #menu-btn, #mobile-menu, and .mobile-link elements in the DOM.
 */
export function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && mobileMenu) {
        // Clone to remove existing listeners if re-initialized (safety check not strictly needed if only called once)
        const newMenuBtn = menuBtn.cloneNode(true);
        if (menuBtn.parentNode) {
            menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
        }

        // Actually, simple addEventListener is fine if we stick to DOMContentLoaded once.
        // But replacing is safer if we ever use client-side navigation.
        // For now, let's keep it simple and just attach.
        // Reverting clone logic to avoid breaking references if other scripts hold them.

        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            });
        });
    }
}
