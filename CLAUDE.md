# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sunday Night Games is a Next.js 15 web application featuring browser-based games built with React 19, TypeScript, and Tailwind CSS. The site hosts multiple HTML5 canvas games with a MongoDB backend for mailing list subscriptions.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production application
npm run start        # Start production server
npm run lint         # Run ESLint for code quality checks
```

### Environment Setup
The application requires environment variables for database connectivity:
- `MONGODB_URI_PROD` - Production MongoDB connection string
- `MONGODB_URI_DEV` - Development MongoDB connection string
- `MONGODB_X509_CERT` - Production X.509 certificate (base64 encoded)
- `MONGODB_X509_CERT_PATH_DEV` - Development certificate file path

## Architecture

### Application Structure
- **Next.js App Router**: Uses the modern app directory structure
- **Client-Side Games**: Canvas-based games implemented as React components with extensive use of `useRef`, `useEffect`, and `requestAnimationFrame`
- **Database**: MongoDB with X.509 certificate authentication for mailing list subscriptions
- **API Routes**: RESTful endpoints in `app/api/` for contact form and mailing list functionality

### Game Architecture
Games follow a consistent pattern:
- Canvas-based rendering with React refs for DOM access
- Game state managed through refs to avoid re-renders during gameplay
- Audio integration using HTML5 audio elements (hidden, no controls)
- Image preloading with Promise-based loading states
- Collision detection and physics engines implemented in game loops
- Restart functionality with game state reset

### Key Components
- `FlappyDonut.tsx`: Complete Flappy Bird clone with pipe generation, collision detection, and progressive difficulty
- `DonutSurvivor.tsx`: Platformer game with procedural level generation and physics
- `MailingListSignup.tsx`: Form component with validation and MongoDB integration
- `Navbar.tsx`: Navigation component with game links

### Database Integration
- X.509 certificate authentication for MongoDB
- Environment-based connection handling (production vs development)
- Input sanitization and validation for email subscriptions
- Duplicate prevention for mailing list signups

### Styling Approach
- Tailwind CSS for component styling
- CSS Modules for game-specific styles (`DonutGame.module.css`)
- Responsive design with mobile-first approach

## File Organization

- `app/` - Next.js app router pages and layouts
- `app/components/` - Reusable React components including games
- `app/utils/` - Database connection and validation utilities
- `app/api/` - API route handlers
- `public/` - Static assets including game images and audio
- `public/images/` - Game-specific image assets

## Development Notes

### Game Development
When modifying game components:
- Maintain the pattern of using refs for game state to prevent React re-renders during gameplay
- Ensure proper cleanup in useEffect return functions (animation frames, event listeners)
- Test audio autoplay behavior - browsers require user interaction for audio playback
- Games use 2D canvas context with `requestAnimationFrame` for smooth animation

### Database Operations
- All database operations use the shared `connectToDatabase` utility
- Email inputs are always sanitized and validated before database operations
- Production uses certificate-based authentication stored in environment variables

### TypeScript Configuration
- Path aliases configured: `@/*` maps to `./`
- Strict mode enabled for type safety
- Next.js plugin integration for optimal bundling