# Print A Pic - Project Overview

## 📱 Project Description
A mobile-first web app for photo customization and sticker printing using a token-based system. Users can capture photos, apply magic enhancements, and order physical stickers.

## 🛠️ Technology Stack
- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS + DaisyUI
- **Icons**: React Feather
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 🎯 Current Features

### 🏠 Homepage
- Fixed top navigation with brand, section links, and sign-in
- Hero section with CTAs
- How It Works, Features, and Pricing sections
- Mobile-responsive hamburger menu

### 🔐 Authentication System
- **Sign In**: Email/password + Google OAuth simulation
- **Sign Up**: Full registration with validation
- **Forgot Password**: Email reset flow
- User session management via localStorage

### 📷 Camera Module
- Live camera feed with mobile-optimized aspect ratios (4:3 mobile, 16:9 desktop)
- Photo capture with flash effect
- Front/back camera switching
- Fullscreen mode with touch controls
- Photo preview and management
- localStorage persistence

### 🖼️ Gallery
- Mobile-first grid layout with responsive cards
- Photo expansion modal with metadata
- Individual photo actions (delete, convert to sticker)
- Batch operations and stats dashboard
- Touch-friendly interface

### ⚙️ Settings
- User profile display
- App preferences (notifications, dark mode, auto-save, quality)
- Usage statistics
- Account management (clear data, logout)
- App information and legal links

### 💰 Pricing
- Token package tiers ($10-$50)
- Usage calculator (2 tokens = magic, 400 tokens = sticker)
- FAQ section with collapsible answers
- Purchase simulation ready for payment integration

### 🧭 Navigation
- **Homepage**: Custom top navbar for marketing
- **App Pages**: Bottom navbar with 5 icons:
  1. Pricing (💳)
  2. Gallery (🖼️) 
  3. Camera (📷)
  4. Settings (⚙️)
  5. Logout (🚪)

## 📱 Mobile-First Design
- Touch-optimized controls and sizing
- Responsive breakpoints (sm, md, lg)
- Mobile camera aspect ratios
- Bottom navigation for thumb accessibility
- Compact UI elements for mobile screens

## 💾 Data Management
- Photos stored in localStorage as base64
- User sessions and preferences in localStorage
- Simulated token system ready for backend integration
- No external APIs currently integrated

## 🚀 Ready for Integration
- Authentication flows prepared for real OAuth
- Payment simulation ready for Stripe/similar
- Camera API fully functional
- Component architecture supports easy backend integration

## 📁 Project Structure
```
src/
├── components/
│   └── BottomNavbar.jsx
├── routes/
│   ├── Homepage.jsx
│   ├── SignIn.jsx
│   ├── SignUp.jsx
│   ├── Camera.jsx
│   ├── Gallery.jsx
│   ├── Settings.jsx
│   ├── Pricing.jsx
│   └── Reference.jsx
├── App.jsx
└── main.jsx
```

## 🎨 Design System
- **Colors**: DaisyUI theme with primary/secondary/accent
- **Typography**: Responsive text sizing
- **Components**: Cards, buttons, modals, forms
- **Icons**: 22px standard size, Feather icon set
- **Spacing**: Mobile-first padding/margins 