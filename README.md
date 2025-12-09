# Adusingi Portfolio

Personal portfolio website for Aimable Dusingizimana - Project Manager & Builder based in Okayama, Japan.

## Tech Stack

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (via CDN)
- **Lucide Icons** - Icon library (via CDN)
- **Vanilla JavaScript** - Interactivity

## Getting Started

This project uses **pnpm** as the package manager.

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

## Project Structure

```
adusingi-web/
├── index.html          # Main HTML file with all content
├── index.tsx           # JavaScript entry point for interactivity
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── eslint.config.js    # ESLint configuration
└── CLAUDE.md          # AI assistant guidance
```

## Architecture

This portfolio uses a vanilla HTML/JavaScript approach:

- **index.html** contains all the site content and structure
- **index.tsx** adds JavaScript interactivity (mobile menu, scroll effects, animations)
- **Tailwind CSS** is loaded via CDN for styling
- **Lucide Icons** is loaded via CDN for icons

## Deployment

The project is configured for deployment on Vercel:

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

The build process runs TypeScript type checking followed by Vite build, outputting to the `dist` directory.

## Features

- Responsive design with mobile-first approach
- Smooth scroll animations using IntersectionObserver
- Mobile menu with toggle functionality
- Dynamic navbar with scroll effects
- Projects showcase
- Experience timeline
- Interests section
- Contact information

## License

© 2025 Aimable Dusingizimana. All rights reserved.
