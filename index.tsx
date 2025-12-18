// Import Styles and Fonts
import './style.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/noto-serif-jp/400.css';
import '@fontsource/noto-serif-jp/500.css';
import '@fontsource/noto-serif-jp/600.css';
import '@fontsource/noto-serif-jp/700.css';
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
  ArrowUpRight,
  Lock,
  Zap,
  MapPin,
  Feather,
  BookOpen,
  Twitter,
  Linkedin,
  Mail
} from 'lucide';

// Initialize Icons
createIcons({
  icons: {
    Menu,
    ArrowUpRight,
    Lock,
    Zap,
    MapPin,
    Feather,
    BookOpen,
    Twitter,
    Linkedin,
    Mail
  }
});

// Import Shared Logic
import { setupMobileMenu } from './src/lib/ui';

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

  // --- Reveal on Scroll Animation ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));
});