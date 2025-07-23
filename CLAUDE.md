# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Core Development:**
- `pnpm dev` - Start development server with Vite
- `pnpm host` - Start development server accessible on local network (port 80)
- `pnpm build` - Build for production (TypeScript check + Vite build)
- `pnpm lint` - Run ESLint for code quality
- `pnpm preview` - Preview production build locally
- `pnpm tbuild` - Build and create tar archive for deployment

## Architecture Overview

This is a **mobile-first React application** for photo customization and AI processing, built with modern tooling and ready for PocketBase backend integration.

**Tech Stack:**
- React 18 + TypeScript + Vite
- React Router DOM v7 for routing
- TailwindCSS + DaisyUI for styling
- PocketBase for authentication and user management
- React Feather for icons

## Authentication System

**PocketBase Integration:**
- Collection: `printapic_users`
- Supports email/password auth and OAuth (Google, GitHub, Discord)
- Environment variable: `VITE_PB_URL` (defaults to http://127.0.0.1:8090)

**Auth Architecture:**
- `authService.js` - Singleton PocketBase client wrapper
- `AuthContext.jsx` - React Context for auth state management
- `AuthWrapper.jsx` - Route protection components with 3 types:
  - `ProtectedRoute` - Requires authentication
  - `PublicOnlyRoute` - Redirects if authenticated (signin/signup)
  - `OptionalRoute` - Works for both states

## Route Structure

```
/ (Homepage - marketing)
/signin, /signup (auth - PublicOnly)
/camera, /gallery, /settings (app - Protected)
/pricing, /contact, /help (info - Optional)
```

**Navigation Patterns:**
- Homepage: Custom top navbar for marketing
- App pages: Bottom navbar with 5 icons (mobile-optimized)

## Component Organization

**Key Directories:**
- `src/components/` - Reusable UI components (many mobile-optimized)
- `src/contexts/` - React Context providers (auth state management)
- `src/hooks/` - Custom hooks (`useMobilePhotoSelection`, `usePhotoProcessing`)
- `src/routes/` - Page components corresponding to routes
- `src/services/` - API abstraction layer (PocketBase auth, mock AI service)
- `src/mocks/` - Mock data for development

## Mobile-First Design

This application is designed mobile-first with:
- TailwindCSS responsive breakpoints
- Touch-optimized interactions
- Bottom navigation for thumb accessibility
- Large touch targets throughout
- Mobile photo capture capabilities

## Development Patterns

**Service Layer Architecture:**
- Abstract service classes for backend integration
- Mock implementations for frontend-independent development
- localStorage for client-side persistence
- Ready for AI processing service integration

**State Management:**
- React Context for global auth state
- Custom hooks for feature-specific state  
- Backend-ready data structures throughout

## Environment Setup

Create `.env.local` with:
```
VITE_PB_URL="your-pocketbase-url"
```

For OAuth setup, ensure your PocketBase OAuth redirect URI is configured as:
`{your-pocketbase-url}/api/oauth2-redirect`