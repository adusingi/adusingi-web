/**
 * Initialize Mobile Menu functionality.
 * Requires #menu-btn, #mobile-menu, and .mobile-link elements in the DOM.
 */
export function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!menuBtn || !mobileMenu) {
        console.warn('Mobile menu elements not found');
        return;
    }

    // Toggle logic
    const toggleMenu = (e: MouseEvent) => {
        e.preventDefault();
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
        } else {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
        }
    };

    const closeMenu = () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
    };

    // Use onclick to ensure we don't stack listeners
    menuBtn.onclick = (e) => toggleMenu(e as MouseEvent);

    mobileLinks.forEach(link => {
        // We can safely add this listener as it's harmless if duplicated (just sets classes)
        // catching the click to close the menu
        link.addEventListener('click', closeMenu);
    });

    // Close on click outside
    const handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as Node;
        if (!menuBtn.contains(target) && !mobileMenu.contains(target) && !mobileMenu.classList.contains('hidden')) {
            closeMenu();
        }
    };

    // Remove previous listener if it exists? 
    // Hard to do with anonymous function. We'll rely on this not accumulating indefinitely 
    // or just accept it for now as page reload clears it.
    document.addEventListener('click', handleOutsideClick);
}

export function setupVideoModal() {
    // Determine context - we might be setting this up early
    // We'll use event delegation for the click to be safe, or just direct attachment if elements exist.
    // Given the ID is unique, direct attachment is fine, but we'll add a check inside the handler.

    const openBtn = document.getElementById('open-taichi-video');

    // We need these for the modal logic
    const modal = document.getElementById('video-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const panel = document.getElementById('modal-panel');
    const closeBtn = document.getElementById('close-video-modal');
    const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;

    // YouTube URL
    const videoUrl = "https://www.youtube.com/embed/v9P1e4yOWJg?autoplay=1&rel=0";
    const externalUrl = "https://youtu.be/v9P1e4yOWJg"; // Better for opening in app

    if (!openBtn) return;

    openBtn.addEventListener('click', (e) => {
        // Check viewport width - md breakpoint is usually 768px
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // Mobile behavior: Open in new tab/app
            window.open(externalUrl, '_blank');
        } else {
            // Desktop behavior: Open Modal
            e.preventDefault();

            if (!modal || !backdrop || !panel || !closeBtn || !iframe) {
                console.error("Modal elements missing");
                return;
            }
            openModal();
        }
    });

    const openModal = () => {
        if (!modal || !backdrop || !panel || !iframe) return;

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
        if (!modal || !backdrop || !panel || !iframe) return;

        backdrop.classList.add('opacity-0');
        panel.classList.remove('opacity-100', 'scale-100');
        panel.classList.add('opacity-0', 'scale-95');

        setTimeout(() => {
            modal.classList.add('hidden');
            iframe.src = ""; // Stop video
            document.body.style.overflow = ''; // Restore scrolling
        }, 300); // Match transition duration
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close on backdrop click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (!modal || !backdrop || !panel) return;
            if (e.target === modal || e.target === backdrop || (e.target as HTMLElement).closest('.flex')) {
                if (!panel.contains(e.target as Node)) {
                    closeModal();
                }
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}
