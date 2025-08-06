/**
 * Cart Service
 * Manages cart state in localStorage and provides cart operations
 */
import { createCartItem } from '../types/orderTypes.js';

class CartService {
  constructor() {
    this.CART_STORAGE_KEY = 'printapic-cart';
  }

  // Get current cart items
  getCartItems() {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return [];
    }
  }

  // Save cart items to localStorage
  saveCartItems(items) {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      return false;
    }
  }

  // Add item to cart
  addToCart(photoId, editId, size, quantity) {
    const cartItems = this.getCartItems();
    
    // Check if item already exists (same editId and size)
    const existingItemIndex = cartItems.findIndex(
      item => item.editId === editId && item.size === size
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      cartItems[existingItemIndex].quantity += quantity;
      cartItems[existingItemIndex].totalPrice = 
        cartItems[existingItemIndex].unitPrice * cartItems[existingItemIndex].quantity;
    } else {
      // Add new item
      const newItem = createCartItem(photoId, editId, size, quantity);
      cartItems.push(newItem);
    }

    this.saveCartItems(cartItems);
    return cartItems;
  }

  // Remove item from cart
  removeFromCart(cartItemId) {
    const cartItems = this.getCartItems();
    const updatedItems = cartItems.filter(item => item.id !== cartItemId);
    this.saveCartItems(updatedItems);
    return updatedItems;
  }

  // Update item quantity
  updateQuantity(cartItemId, newQuantity) {
    if (newQuantity <= 0) {
      return this.removeFromCart(cartItemId);
    }

    const cartItems = this.getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === cartItemId);
    
    if (itemIndex >= 0) {
      cartItems[itemIndex].quantity = newQuantity;
      cartItems[itemIndex].totalPrice = 
        cartItems[itemIndex].unitPrice * newQuantity;
      this.saveCartItems(cartItems);
    }

    return cartItems;
  }

  // Get cart totals
  getCartTotals() {
    const items = this.getCartItems();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    return {
      itemCount,
      subtotal,
      tokensCost: 100, // Fixed cost as per requirements
      items
    };
  }

  // Clear cart
  clearCart() {
    localStorage.removeItem(this.CART_STORAGE_KEY);
    return [];
  }

  // Get cart item count for badge display
  getCartItemCount() {
    const items = this.getCartItems();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

// Export singleton instance
export const cartService = new CartService();