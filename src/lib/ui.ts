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

export function setupVideoModal() {
    const modal = document.getElementById('video-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const panel = document.getElementById('modal-panel');
    const openBtn = document.getElementById('open-taichi-video');
    const closeBtn = document.getElementById('close-video-modal');
    const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;

    if (!modal || !backdrop || !panel || !openBtn || !closeBtn || !iframe) return;

    const videoUrl = "https://www.youtube.com/embed/v9P1e4yOWJg?autoplay=1&rel=0";

    const openModal = () => {
        modal.classList.remove('hidden');
        // Small timeout to allow display:block to apply before opacity transition
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            panel.classList.remove('opacity-0', 'scale-95');
            panel.classList.add('opacity-100', 'scale-100');
        }, 10);
        iframe.src = videoUrl;
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeModal = () => {
        backdrop.classList.add('opacity-0');
        panel.classList.remove('opacity-100', 'scale-100');
        panel.classList.add('opacity-0', 'scale-95');

        setTimeout(() => {
            modal.classList.add('hidden');
            iframe.src = ""; // Stop video
            document.body.style.overflow = ''; // Restore scrolling
        }, 300); // Match transition duration
    };

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === backdrop || (e.target as HTMLElement).closest('.flex')) {
            // The structure is nested, we want to close if clicking outside the panel.
            // The click might bubble up.
            // Simplest check: if panel does NOT contain target
            if (!panel.contains(e.target as Node)) {
                closeModal();
            }
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}
