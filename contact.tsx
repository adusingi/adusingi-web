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
  Map,
  Calendar,
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
    Map,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Twitter,
    Linkedin,
    Mail
  }
});

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();

  // --- Contact Form Toggle ---
  const contactForms = document.querySelectorAll('.contact-form');
  const contactCards = document.querySelectorAll('a[href^="#"]');

  // Function to show a specific form and hide others
  const showForm = (formId: string) => {
    contactForms.forEach(form => {
      if (form.id === formId) {
        form.classList.remove('hidden');
        // Smooth scroll to form
        setTimeout(() => {
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        form.classList.add('hidden');
      }
    });
  };

  // Handle card clicks
  contactCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const href = card.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const formId = href.substring(1);
        const form = document.getElementById(formId);
        if (form && form.classList.contains('contact-form')) {
          e.preventDefault();
          showForm(formId);
          // Update URL hash without scrolling
          history.pushState(null, '', href);
        }
      }
    });
  });

  // Handle initial hash on page load
  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    const formId = hash.substring(1);
    const form = document.getElementById(formId);
    if (form && form.classList.contains('contact-form')) {
      showForm(formId);
    }
  }

  // Handle browser back/forward navigation
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const formId = hash.substring(1);
      const form = document.getElementById(formId);
      if (form && form.classList.contains('contact-form')) {
        showForm(formId);
      }
    } else {
      // Hide all forms if no hash
      contactForms.forEach(form => form.classList.add('hidden'));
    }
  });
});
