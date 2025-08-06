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

      // Process cart items and ensure we have valid edit IDs
      const processedEditIds = [];
      
      for (const item of cartItems) {
        if (!item.editId) {
          throw new Error('Cart item missing photo/edit ID');
        }
        
        let editId = item.editId;
        
        // Check if this editId exists in the edits collection
        try {
          await this.pb.collection('printapic_edits').getOne(editId);
          // If we get here, it's a valid edit record
          processedEditIds.push(editId);
        } catch (error) {
          // If not found, this might be a photo ID, so create a print edit record
          if (error.status === 404) {
            try {
              // Verify the photo exists
              const photo = await this.pb.collection('printapic_photos').getOne(editId);
              
              // Create a simple edit record for printing the original photo
              const printEdit = await this.pb.collection('printapic_edits').create({
                user: userId,
                photo: photo.id,
                status: 'done', // Mark as done since it's just the original
                tokens_cost: 0, // No cost for original photo "processing"
                completed: new Date().toISOString()
              });
              
              processedEditIds.push(printEdit.id);
            } catch (photoError) {
              throw new Error(`Invalid photo/edit ID: ${editId}`);
            }
          } else {
            throw new Error(`Error validating edit ID ${editId}: ${error.message}`);
          }
        }
      }

      // Update cart items to use processed edit IDs
      const updatedCartItems = cartItems.map((item, index) => ({
        ...item,
        editId: processedEditIds[index]
      }));

      // Create order data
      const orderData = createOrder(updatedCartItems, shippingAddress, userId);
      
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