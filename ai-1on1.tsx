// Import Styles and Fonts
import './style.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/inconsolata/400.css';
import '@fontsource/inconsolata/500.css';
import '@fontsource/inconsolata/600.css';
import '@fontsource/inconsolata/700.css';

// Import Lucide Icons
import {
    createIcons,
    Menu,
    MessageSquare,
    Zap,
    Briefcase,
    ArrowRight,
    ArrowLeft,
    Twitter,
    Linkedin,
    Mail
} from 'lucide';

// Import Shared Logic
import { setupMobileMenu } from './src/lib/ui';

// Initialize Icons
createIcons({
    icons: {
        Menu,
        MessageSquare,
        Zap,
        Briefcase,
        ArrowRight,
        ArrowLeft,
        Twitter,
        Linkedin,
        Mail
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    setupMobileMenu();

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar?.classList.add('bg-white/90', 'backdrop-blur-md', 'shadow-sm', 'py-4');
            navbar?.classList.remove('py-6', 'bg-transparent');
        } else {
            navbar?.classList.remove('bg-white/90', 'backdrop-blur-md', 'shadow-sm', 'py-4');
            navbar?.classList.add('py-6', 'bg-transparent');
        }
    });
});
