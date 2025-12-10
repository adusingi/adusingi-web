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

document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Menu Toggle ---
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('flex');

      // Update Icon (Simple toggle attribute or replace SVG if needed, but standard lucide replacement happens on load)
      // For simplicity in Vanilla with Lucide CDN, we just let it be.
      // Or we could re-run createIcons if we changed innerHTML.
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
      });
    });
  }

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