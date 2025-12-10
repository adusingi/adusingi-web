# Project Handover Summary: Adusingi Portfolio

## 1. Project Overview
**Name:** adusingi-portfolio
**Type:** Personal Portfolio Website
**Goal:** Showcase projects, experience, and interests for Aimable Dusingizimana.
**Current State:** Fully functional, reliable, production-ready.

## 2. Technology Stack
- **Build System:** [Vite](https://vitejs.dev/) (Fast development server and bundler)
- **Language:** TypeScript / Vanilla JavaScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Currently loaded via CDN in `index.html`)
- **Icons:** [Lucide Icons](https://lucide.dev/) (Loaded via CDN)
- **Package Manager:** `pnpm`

## 3. Architecture & Implementation Patterns
### Hybrid "Vanilla-in-Vite" Approach
This project operates as a **static site** but uses a modern Vite build chain.
- **Rendering:** All HTML is static in `index.html`. There is **NO** Client-Side Rendering (CSR) framework (like React or Vue) controlling the DOM structure.
- **Interactivity:** `index.tsx` serves as the entry point for "sprinkles" of interactivity (mobile menu, scroll effects). It uses standard DOM APIs (`document.getElementById`, `addEventListener`).
- **Styling Strategy:** Utility-first using Tailwind. Note that Tailwind is currently loaded via a `<script src="https://cdn.tailwindcss.com"></script>` tag. This is great for prototyping but differs from a standard "build-step" Tailwind setup.

> [!NOTE]
> **React Discrepancy:** The `package.json` includes `react`, `react-dom`, and `@vitejs/plugin-react`. However, the application **does not use React** for rendering. `index.tsx` does not call `createRoot` or `ReactDOM.render`. These dependencies are currently unused overhead or remnants of a project template.

## 4. Directory Structure
The project uses a flat structure for simplicity:

```
adusingi-web/
├── index.html          # PRIMARY source of truth. Contains all page content.
├── index.tsx           # Logic layer. Handles DOM events (menu, scroll, animations).
├── public/             # Static assets (images, favicon, etc.)
├── vite.config.ts      # Vite configuration.
├── tsconfig.json       # TypeScript config.
├── package.json        # Dependencies.
└── dist/               # (Generated) Production build output.
```

## 5. Key Features & How They Work
- **Mobile Menu:** Simple toggle logic in `index.tsx` that adds/removes `hidden`/`flex` classes on the menu container.
- **Scroll Effects:** A 'glassmorphism' effect is applied to the navbar when `window.scrollY > 20`.
- **Reveal Animations:** Uses `IntersectionObserver` in `index.tsx`. Elements with class `.reveal` fade in when they scroll into view.

## 6. Recommendations for Next Team
> [!IMPORTANT]
> **Cleanup Opportunities:**
> 1.  **Remove Unused React:** If the intention is to keep this simple, remove `react`, `react-dom`, and `@vitejs/plugin-react`.
> 2.  **Migrate Tailwind:** Move from CDN-based Tailwind to specific PostCSS installation for better performance.

## 7. Deployment
Configured for **Vercel**.
- **Command:** `vercel --prod`
- **Output Directory:** `dist`
