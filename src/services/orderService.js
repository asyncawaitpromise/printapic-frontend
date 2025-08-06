/**
 * Order Service
 * Handles order creation and management via PocketBase
 */
import { authService } from './authService.js';
import { createOrder } from '../types/orderTypes.js';

class OrderService {
  constructor() {
    this.pb = authService.pb;
    this.collectionName = 'printapic_orders';
  }

  // Create a new order
  async createOrder(cartItems, shippingAddress) {
    try {
      if (!authService.isAuthenticated) {
        throw new Error('Must be authenticated to create an order');
      }

      const userId = authService.pb.authStore.model?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Validate that user has enough tokens (100 tokens required)
      const user = await authService.pb.collection('printapic_users').getOne(userId);
      if (user.tokens < 100) {
        throw new Error(`Insufficient tokens. You have ${user.tokens} tokens but need 100 tokens to place an order.`);
      }

      // Validate cart items have edit IDs
      const editIds = cartItems.map(item => item.editId).filter(Boolean);
      if (editIds.length === 0) {
        throw new Error('Cart contains no valid processed photos');
      }

      if (editIds.length !== cartItems.length) {
        throw new Error('Some cart items do not have processed photos. Please ensure all photos are processed before ordering.');
      }

      // Create order data
      const orderData = createOrder(cartItems, shippingAddress, userId);
      
      // Create order in PocketBase
      const order = await this.pb.collection(this.collectionName).create(orderData);

      // Deduct tokens from user (this should ideally be handled by backend hooks)
      await this.pb.collection('printapic_users').update(userId, {
        tokens: user.tokens - 100
      });

      return {
        success: true,
        order,
        message: 'Order placed successfully! You will receive tracking information once your prints are ready.'
      };

    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error.message || 'Failed to create order',
        order: null
      };
    }
  }

  // Get user's orders
  async getUserOrders() {
    try {
      if (!authService.isAuthenticated) {
        throw new Error('Must be authenticated to view orders');
      }

      const userId = authService.pb.authStore.model?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Fetch orders with expanded edits and photos
      const orders = await this.pb.collection(this.collectionName).getFullList({
        filter: `user = "${userId}"`,
        sort: '-created',
        expand: 'edits,edits.photo,user'
      });

      return {
        success: true,
        orders
      };

    } catch (error) {
      console.error('Error fetching user orders:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch orders',
        orders: []
      };
    }
  }

  // Get single order details
  async getOrder(orderId) {
    try {
      if (!authService.isAuthenticated) {
        throw new Error('Must be authenticated to view order');
      }

      const order = await this.pb.collection(this.collectionName).getOne(orderId, {
        expand: 'edits,edits.photo,user'
      });

      // Verify user owns this order
      const userId = authService.pb.authStore.model?.id;
      if (order.user !== userId) {
        throw new Error('Not authorized to view this order');
      }

      return {
        success: true,
        order
      };

    } catch (error) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch order',
        order: null
      };
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();