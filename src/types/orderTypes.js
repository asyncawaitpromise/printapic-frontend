/**
 * Order and Cart Type Definitions
 * Based on PocketBase schema from createPrintapicCollections.js
 */

// Size options for prints
export const PRINT_SIZES = {
  small: {
    label: 'Small (4x6")',
    price: 5.99,
    dimensions: '4" x 6"'
  },
  medium: {
    label: 'Medium (5x7")',
    price: 8.99,
    dimensions: '5" x 7"'
  },
  large: {
    label: 'Large (8x10")',
    price: 14.99,
    dimensions: '8" x 10"'
  }
};

// Order item structure (for cart items before finalizing)
export const createCartItem = (photoId, editId, size, quantity) => ({
  id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  photoId,
  editId, // This will be the processed photo/edit ID
  size,
  quantity,
  unitPrice: PRINT_SIZES[size].price,
  totalPrice: PRINT_SIZES[size].price * quantity,
  addedAt: new Date().toISOString()
});

// Shipping address structure
export const createShippingAddress = () => ({
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US'
});

// Payment method structure (for UI only - actual payment handled by tokens)
export const createPaymentMethod = () => ({
  type: 'tokens', // Only tokens supported
  description: 'Pay with 100 tokens'
});

// Order structure (matches PocketBase schema)
export const createOrder = (cartItems, shippingAddress, userId) => {
  const totalTokensCost = 100; // Fixed cost as per requirements
  
  return {
    user: userId,
    edits: cartItems.map(item => item.editId), // Array of edit IDs
    shipping_address: shippingAddress, // JSON field in PocketBase
    status: 'pending',
    tokens_cost: totalTokensCost,
    // These fields will be set by backend/admin:
    // tracking_number: null,
    // created: auto-set by PocketBase
    // updated: auto-set by PocketBase
  };
};

// Order status labels for display
export const ORDER_STATUS_LABELS = {
  pending: 'Order Placed',
  printing: 'Printing',
  shipped: 'Shipped',
  delivered: 'Delivered'
};