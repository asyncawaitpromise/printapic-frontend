import { authService } from './authService';

/**
 * Real Image Processing Service that integrates with the backend API
 * Based on FRONTEND_API_INSTRUCTIONS.md
 */
class ImageProcessingService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    this.activeSubscriptions = new Set();
  }

  /**
   * Process image with artistic effects using the real API
   * @param {string} photoId - PocketBase record ID of the photo
   * @param {string} promptKey - Style preset (sticker, line-art, van-gogh, manga-style, oil-painting)
   * @param {Function} onStatusUpdate - Callback for real-time status updates
   * @returns {Promise<Object>} - Processing result
   */
  async processImage(photoId, promptKey = 'sticker', onStatusUpdate = null) {
    try {
      console.log('🎯 Starting real image processing:', { photoId, promptKey });

      // Validate promptKey
      const validPromptKeys = ['sticker', 'line-art', 'van-gogh', 'manga-style', 'oil-painting'];
      if (!validPromptKeys.includes(promptKey)) {
        throw new Error(`Invalid promptKey: ${promptKey}. Valid options are: ${validPromptKeys.join(', ')}`);
      }

      // Get authentication token
      const pb = authService.pb;
      if (!pb.authStore.isValid) {
        throw new Error('User must be authenticated to process images');
      }

      const token = pb.authStore.token;
      const userId = pb.authStore.model?.id;

      if (!token || !userId) {
        throw new Error('Invalid authentication state');
      }

      // Set up real-time subscription for processing completion
      let unsubscribe = null;
      if (onStatusUpdate) {
        unsubscribe = await this.setupRealtimeSubscription(userId, onStatusUpdate);
      }

      // Call the real API endpoint
      const response = await fetch(`${this.baseUrl}/process-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photoId: photoId,
          operation: 'sticker', // Currently only sticker operation is supported
          promptKey: promptKey
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Clean up subscription on error
        if (unsubscribe) {
          this.cleanup(unsubscribe);
        }
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Image processing started:', result);

      return {
        success: true,
        editId: result.editId,
        message: result.message,
        unsubscribe: unsubscribe // Return cleanup function
      };

    } catch (error) {
      console.error('❌ Image processing failed:', error);
      throw error;
    }
  }

  /**
   * Set up PocketBase real-time subscription for processing updates
   * @param {string} userId - Current user ID
   * @param {Function} onStatusUpdate - Callback for status updates
   * @returns {Function} - Unsubscribe function
   */
  async setupRealtimeSubscription(userId, onStatusUpdate) {
    const pb = authService.pb;

    try {
      // Subscribe to new photos for processing completion
      const unsubscribe = await pb.collection('printapic_photos').subscribe('*', (e) => {
        if (e.action === 'create' && e.record.user === userId) {
          console.log('📸 New processed photo created:', e.record.id);
          
          // Notify about completion
          onStatusUpdate({
            status: 'complete',
            message: 'Processing complete! New photo created.',
            newPhotoId: e.record.id,
            newPhotoRecord: e.record
          });

          // Clean up this subscription after completion
          this.cleanup(unsubscribe);
        }
      }, {
        filter: `user = "${userId}"`
      });

      this.activeSubscriptions.add(unsubscribe);
      console.log('🔔 Real-time subscription setup complete');
      
      return unsubscribe;

    } catch (error) {
      console.error('❌ Failed to setup real-time subscription:', error);
      
      // Fallback: simulate processing completion after timeout
      setTimeout(() => {
        onStatusUpdate({
          status: 'complete',
          message: 'Processing may have completed. Please refresh your gallery.',
          simulatedCompletion: true
        });
      }, 30000); // 30 second fallback
      
      return () => {}; // Return no-op cleanup function
    }
  }

  /**
   * Alternative: Subscribe to edit status changes instead of new photos
   * @param {string} editId - Edit record ID to monitor
   * @param {Function} onStatusUpdate - Callback for status updates
   * @returns {Function} - Unsubscribe function
   */
  async subscribeToEditStatus(editId, onStatusUpdate) {
    const pb = authService.pb;

    try {
      const unsubscribe = await pb.collection('printapic_edits').subscribe(editId, (e) => {
        if (e.action === 'update') {
          console.log('📝 Edit status updated:', e.record.status);
          
          const status = e.record.status;
          let statusUpdate = {};

          switch (status) {
            case 'processing':
              statusUpdate = {
                status: 'processing',
                message: 'AI is processing your image...',
                editRecord: e.record
              };
              break;
            case 'done':
              statusUpdate = {
                status: 'complete',
                message: 'Processing complete! New photo created.',
                tokensUsed: e.record.tokens_cost,
                editRecord: e.record
              };
              // Clean up subscription when done
              this.cleanup(unsubscribe);
              break;
            case 'failed':
              statusUpdate = {
                status: 'error',
                message: 'Processing failed. Please try again.',
                editRecord: e.record
              };
              // Clean up subscription on failure
              this.cleanup(unsubscribe);
              break;
            default:
              statusUpdate = {
                status: 'unknown',
                message: `Status: ${status}`,
                editRecord: e.record
              };
          }

          onStatusUpdate(statusUpdate);
        }
      });

      this.activeSubscriptions.add(unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('❌ Failed to subscribe to edit status:', error);
      return () => {}; // Return no-op cleanup function
    }
  }

  /**
   * Clean up a specific subscription
   * @param {Function} unsubscribe - Unsubscribe function
   */
  cleanup(unsubscribe) {
    if (unsubscribe && typeof unsubscribe === 'function') {
      try {
        unsubscribe();
        this.activeSubscriptions.delete(unsubscribe);
        console.log('🧹 Subscription cleaned up');
      } catch (error) {
        console.error('❌ Error cleaning up subscription:', error);
      }
    }
  }

  /**
   * Clean up all active subscriptions (call on component unmount)
   */
  cleanupAll() {
    console.log(`🧹 Cleaning up ${this.activeSubscriptions.size} active subscriptions`);
    
    this.activeSubscriptions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
    });
    
    this.activeSubscriptions.clear();
  }

  /**
   * Get user's current token balance
   * @returns {Promise<number>} - Token balance
   */
  async getUserTokenBalance() {
    try {
      const pb = authService.pb;
      if (!pb.authStore.isValid) {
        return 0;
      }

      const user = await pb.collection('printapic_users').getOne(pb.authStore.model.id);
      return user.tokens || 0; // Field is 'tokens' not 'token_balance'
      
    } catch (error) {
      console.error('❌ Failed to get user token balance:', error);
      return 0;
    }
  }

  /**
   * Check if user has sufficient tokens for processing
   * @param {number} requiredTokens - Number of tokens needed (default 1)
   * @returns {Promise<boolean>} - Whether user has enough tokens
   */
  async hasEnoughTokens(requiredTokens = 1) {
    const balance = await this.getUserTokenBalance();
    return balance >= requiredTokens;
  }
}

// Create and export singleton instance
export const imageProcessingService = new ImageProcessingService();
export default imageProcessingService;