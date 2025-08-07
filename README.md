# PrintaPic Frontend

A mobile-first React application for AI-powered photo customization and sticker processing.

## Features

- **AI Photo Processing**: Upload photos and apply AI-powered sticker processing
- **Mobile-Optimized**: Touch-friendly interface with bottom navigation
- **Order Management**: Complete order system with pricing and shipping
- **Authentication**: PocketBase integration with email/password and OAuth support
- **Responsive Design**: Works seamlessly across devices

## Tech Stack

- React 18 + TypeScript + Vite
- React Router DOM v7 for routing
- TailwindCSS + DaisyUI for styling
- PocketBase for authentication and user management
- React Feather for icons

## Quick Start

1. Install dependencies:
   ```bash
   pnpm i
   ```

2. Create `.env` file:
   ```
   VITE_PB_URL="your-pocketbase-url"
   ```

3. Start development server:
   ```bash
   pnpm host
   ```

4. Build for production:
   ```bash
   pnpm build
   ```

## Project Structure

- `/src/routes/` - Page components (Camera, Gallery, Settings, etc.)
- `/src/components/` - Reusable UI components
- `/src/services/` - API abstraction layer
- `/src/contexts/` - React Context providers
- `/src/hooks/` - Custom hooks for photo processing and selection

See `CLAUDE.md` for detailed development guidance.
