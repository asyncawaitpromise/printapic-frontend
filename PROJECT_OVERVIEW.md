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
- **AI Processing**: Flux Kontext backend for text-based photo editing

## 🚀 Ready for Integration
- Authentication flows prepared for real OAuth
- Payment simulation ready for Stripe/similar
- Camera API fully functional
- **AI Backend**: Flux Kontext integration for photo processing
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

---

# 🎯 FEATURE SPECIFICATIONS

## User Experience Goals
1. **Photo Input**: Upload or take photos easily
2. **Photo Review**: See all uploaded/captured photos
3. **Photo Selection**: Choose photos for sticker conversion
4. **AI Enhancement**: Apply simple, powerful AI effects with one tap
5. **Sticker Configuration**: Choose size, shape, and finish options
6. **Order Creation**: Select quantities and customize orders
7. **Address Management**: Ship to saved addresses
8. **Order Tracking**: Monitor order status and shipping

## 🤖 AI Integration Strategy
- **User-Friendly Labels**: Hide technical complexity behind simple options
- **Pre-Built Workflows**: Curated Flux Kontext prompts for best results
- **Token Transparency**: Clear cost display before processing
- **Processing Feedback**: Real-time status updates during AI generation
- **Fallback Handling**: Graceful error recovery for failed generations
- **Batch Processing**: Efficient handling of multiple photos
- **Result Caching**: Store processed images to avoid re-processing

### 🎨 Proposed AI Workflow Examples
```javascript
// Example workflow definitions for backend
const aiWorkflows = [
  {
    id: 'remove-background',
    name: 'Remove Background',
    description: 'Clean cutout perfect for stickers',
    prompt: 'Remove background completely, clean edges, transparent background',
    tokenCost: 2,
    category: 'background',
    estimatedTime: 15
  },
  {
    id: 'enhance-colors',
    name: 'Make it Pop',
    description: 'Vibrant colors and crisp details',
    prompt: 'Enhance colors, increase vibrancy, sharpen details, professional photo enhancement',
    tokenCost: 1,
    category: 'enhancement',
    estimatedTime: 10
  },
  {
    id: 'cartoon-style',
    name: 'Cartoon Style',
    description: 'Fun illustrated look',
    prompt: 'Convert to cartoon illustration style, vibrant colors, clean lines',
    tokenCost: 3,
    category: 'style',
    estimatedTime: 20
  },
  {
    id: 'vintage-filter',
    name: 'Vintage Look',
    description: 'Classic retro aesthetic',
    prompt: 'Apply vintage filter, warm tones, slight grain, retro aesthetic',
    tokenCost: 1,
    category: 'effect',
    estimatedTime: 10
  }
];
```

### 🔧 Technical Implementation Notes
- **API Design**: RESTful endpoints for each workflow type
- **Status Polling**: WebSocket or polling for processing updates
- **Error Recovery**: Retry logic for failed generations
- **Cost Management**: Pre-flight token validation
- **Quality Control**: Automatic result validation before delivery

## 📋 Implementation Specifications

### 1. 📸 Photo Input Enhancement
**Current State**: Camera capture only
**Target State**: Camera + file upload

#### New Features Needed:
- **File Upload Component**
  - Drag & drop zone in Camera page
  - File picker button (JPEG, PNG, HEIC support)
  - Image validation (size, format, dimensions)
  - Preview before adding to gallery
  - Progress indicator for large files

#### Technical Requirements:
- File size limit: 10MB max
- Supported formats: JPEG, PNG, HEIC, WebP
- Auto-resize for optimal processing
- Maintain EXIF data for orientation
- Add upload source metadata to photo objects

#### UI Changes:
- Add upload section to Camera page
- Toggle between "Take Photo" and "Upload Photo" modes
- Visual feedback for upload progress
- Error handling for unsupported files

### 2. 🖼️ Gallery Enhancement
**Current State**: Basic photo viewing
**Target State**: Selection and management interface

#### New Features Needed:
- **Multi-Select Mode**
  - Checkbox overlay on photos
  - "Select All" / "Deselect All" buttons
  - Selected count indicator
  - Bulk actions toolbar

- **Photo Metadata Display**
  - Source (camera/upload)
  - Date/time captured
  - File size and dimensions
  - Processing status

#### Technical Requirements:
- Selection state management
- Batch operations support
- Photo status tracking (original, processed, ordered)
- Enhanced localStorage schema for metadata

#### UI Changes:
- Selection mode toggle
- Visual selection indicators
- Bulk action buttons
- Status badges on photos

### 3. 🎨 AI-Powered Sticker Customization
**Current State**: Basic "Make Sticker" placeholder
**Target State**: AI-driven photo editing with simple user controls

#### New Features Needed:
- **Simple Style Options** (trigger AI workflows)
  - "Remove Background" → Flux prompt for clean cutout
  - "Make it Pop" → Color enhancement and contrast
  - "Cartoon Style" → Stylized illustration conversion
  - "Vintage Look" → Retro filter application
  - "Clean & Bright" → Professional photo enhancement
  - "Add Border" → White/black border generation

- **Sticker Format Options**
  - Shape: Square, Circle, Rounded, Custom Cut
  - Size: Small (2"), Medium (3"), Large (4"), Custom
  - Finish: Matte, Glossy, Transparent backing
  - Border: None, White, Black, Colored

- **AI Processing Flow**
  - User selects simple option
  - Frontend sends photo + style prompt to backend
  - Flux Kontext processes with pre-built workflows
  - Processed image returned and cached
  - User sees before/after comparison

#### Technical Requirements:
- **Backend Integration**
  - API endpoints for each style workflow
  - Image upload/download handling
  - Processing status tracking
  - Error handling for failed generations

- **Frontend Processing**
  - Upload progress indicators
  - Processing status display
  - Result caching and management
  - Token cost calculation per operation

#### UI Components:
- Simple style button grid (6-8 options)
- Processing status overlay
- Before/after comparison slider
- "Try Another Style" quick actions
- Cost preview before processing

### 4. 🛒 Order Management System
**Current State**: None
**Target State**: Complete ordering workflow

#### New Features Needed:
- **Order Configuration**
  - Quantity selector (1-100 per design)
  - Size selection with pricing
  - Finish options
  - Shipping speed selection
  - Order summary with costs

- **Cart System**
  - Multiple designs in one order
  - Quantity adjustments
  - Remove items
  - Order total calculation
  - Token balance validation

#### Technical Requirements:
- Order state management
- Pricing calculation engine
- Token deduction system
- Order history tracking
- Cart persistence

#### UI Components:
- Quantity stepper
- Size/finish selectors
- Cart sidebar/page
- Order summary cards
- Checkout flow

### 5. 📍 Address Management
**Current State**: None
**Target State**: Multiple saved addresses

#### New Features Needed:
- **Address Book**
  - Add/edit/delete addresses
  - Set default shipping address
  - Address validation
  - Multiple address support
  - Quick address selection

- **Address Form**
  - Auto-complete integration
  - Address validation
  - International support
  - Save for future use
  - Nickname system

#### Technical Requirements:
- Address validation API integration
- localStorage address storage
- Default address logic
- Address format standardization

#### UI Components:
- Address list view
- Address form modal
- Address picker
- Validation feedback
- Quick-add buttons

### 6. 🚚 Order Processing Flow
**Current State**: None
**Target State**: Complete order lifecycle

#### New Features Needed:
- **Order Review**
  - Final design preview
  - Shipping details confirmation
  - Cost breakdown
  - Terms acceptance
  - Order placement

- **Order Tracking**
  - Order status updates
  - Tracking information
  - Delivery estimates
  - Order history

#### Technical Requirements:
- Order submission API
- Status tracking system
- Email notification hooks
- Order persistence
- Payment processing integration

#### UI Components:
- Order review screen
- Confirmation modals
- Status timeline
- Order history list
- Tracking display

## 🔄 Implementation Priority

### Phase 1: Core Functionality
1. File upload system
2. Gallery multi-select
3. **AI Backend Integration** (Flux Kontext API)
4. Basic AI style workflows (6-8 simple options)
5. Address management

### Phase 2: Enhanced Features
1. **Advanced AI Workflows** (more style options)
2. Order cart system
3. Order review flow
4. **Processing Queue Management**
5. Order tracking

### Phase 3: Polish & Integration
1. Payment processing
2. Real-time order updates
3. **Custom AI Prompt Builder** (advanced users)
4. **Batch Processing** for multiple photos
5. Performance optimization

## 📱 Mobile-First Considerations
- Touch-friendly selectors and sliders
- Swipe gestures for style browsing
- Optimized upload for mobile cameras
- Simplified multi-select for touch
- One-handed operation support
- Responsive order forms

## 💾 Data Schema Extensions
```javascript
// Enhanced Photo Object
{
  id: string,
  data: base64,
  source: 'camera' | 'upload',
  timestamp: ISO8601,
  metadata: {
    width: number,
    height: number,
    fileSize: number,
    originalName?: string
  },
  processing: {
    status: 'original' | 'processing' | 'enhanced' | 'failed',
    aiWorkflows: [{
      workflowId: string,
      prompt: string,
      status: 'pending' | 'processing' | 'completed' | 'failed',
      resultImageUrl?: string,
      tokensUsed: number,
      processedAt?: ISO8601,
      error?: string
    }],
    currentStyle?: StickerStyle
  },
  orders: OrderReference[]
}

// AI Workflow Definitions
{
  id: string,
  name: string,
  description: string,
  prompt: string,
  tokenCost: number,
  category: 'enhancement' | 'style' | 'background' | 'effect',
  previewImage: string,
  estimatedTime: number // seconds
}

// Sticker Configuration Object
{
  id: string,
  shape: 'square' | 'circle' | 'rounded' | 'custom',
  size: 'small' | 'medium' | 'large' | 'custom',
  dimensions?: { width: number, height: number },
  finish: 'matte' | 'glossy' | 'transparent',
  border: 'none' | 'white' | 'black' | 'colored',
  borderColor?: string
}

// New Address Object
{
  id: string,
  nickname: string,
  name: string,
  address1: string,
  address2?: string,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  isDefault: boolean
}

// New Order Object
{
  id: string,
  userId: string,
  items: [{
    photoId: string,
    style: StickerStyle,
    quantity: number,
    unitPrice: number
  }],
  shippingAddress: Address,
  status: 'pending' | 'processing' | 'shipped' | 'delivered',
  tokensUsed: number,
  createdAt: ISO8601,
  trackingNumber?: string
}
``` 