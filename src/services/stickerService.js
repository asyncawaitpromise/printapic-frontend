import authService from './authService.js';

class StickerProcessor {
  constructor() {
    this.pb = authService.getPB();
    this.apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // Express backend URL
  }

  async createSticker(pocketbaseRecordId) {
    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated) {
        throw new Error('User not authenticated');
      }

      // Validate that we have a PocketBase record ID
      if (!pocketbaseRecordId) {
        throw new Error('Photo must be synced to cloud before creating sticker');
      }

      // Debug logging
      console.log('🔐 Auth token:', this.pb.authStore.token ? 'Present' : 'Missing');
      console.log('🌐 API URL:', `${this.apiBase}/process-image`);
      console.log('📸 PocketBase Record ID:', pocketbaseRecordId);
      
      const response = await fetch(`${this.apiBase}/process-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pb.authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photoId: pocketbaseRecordId, // Use PocketBase record ID, not local photo ID
          operation: 'sticker'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Processing failed');
      }

      const result = await response.json();
      return result.editId;
    } catch (error) {
      console.error('Failed to start sticker processing:', error);
      throw error;
    }
  }

  async getEditStatus(editId) {
    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.apiBase}/edit-status/${editId}`, {
        headers: {
          'Authorization': `Bearer ${this.pb.authStore.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get status');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get edit status:', error);
      throw error;
    }
  }

  async pollUntilComplete(editId, onUpdate = null) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getEditStatus(editId);

          if (onUpdate) onUpdate(status);

          if (status.status === 'done') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error('Processing failed'));
          } else {
            // Continue polling every 2 seconds
            setTimeout(poll, 2000);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

// Create singleton instance
export const stickerService = new StickerProcessor();
export default stickerService;