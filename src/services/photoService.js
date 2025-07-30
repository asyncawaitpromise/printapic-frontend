import { authService } from './authService.js';

class PhotoService {
  constructor() {
    this.pb = authService.getPB();
    this.collectionName = 'printapic_photos';
  }

  // Check if user is authenticated
  get isAuthenticated() {
    return authService.isAuthenticated;
  }

  // Upload photo to PocketBase
  async uploadPhoto(photoData, caption = '') {
    if (!this.isAuthenticated) {
      throw new Error('User must be authenticated to upload photos');
    }

    try {
      // Convert base64 to File object
      const base64Data = photoData.data.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], `photo_${photoData.id}.jpg`, { type: 'image/jpeg' });

      // Create FormData for upload
      const formData = new FormData();
      formData.append('user', authService.currentUser.id);
      formData.append('image', file);
      formData.append('caption', caption);

      // Upload to PocketBase
      const record = await this.pb.collection(this.collectionName).create(formData);
      
      return {
        success: true,
        photo: this._formatPhotoRecord(record, photoData)
      };
    } catch (error) {
      console.error('Failed to upload photo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all user's photos from PocketBase
  async getUserPhotos() {
    if (!this.isAuthenticated) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `user = "${authService.currentUser.id}"`,
        sort: '-created',
        expand: 'user'
      });

      const photos = records.map(record => this._formatPhotoRecord(record));
      
      return {
        success: true,
        photos
      };
    } catch (error) {
      console.error('Failed to get user photos:', error);
      return {
        success: false,
        error: error.message,
        photos: []
      };
    }
  }

  // Delete photo from PocketBase
  async deletePhoto(photoId) {
    if (!this.isAuthenticated) {
      throw new Error('User must be authenticated to delete photos');
    }

    try {
      await this.pb.collection(this.collectionName).delete(photoId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete photo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update photo caption
  async updatePhotoCaption(photoId, caption) {
    if (!this.isAuthenticated) {
      throw new Error('User must be authenticated to update photos');
    }

    try {
      const record = await this.pb.collection(this.collectionName).update(photoId, {
        caption
      });
      
      return {
        success: true,
        photo: this._formatPhotoRecord(record)
      };
    } catch (error) {
      console.error('Failed to update photo caption:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get photo URL from PocketBase
  getPhotoUrl(record, thumb = '500x0') {
    if (!record.image) return null;
    
    return this.pb.files.getUrl(record, record.image, { thumb });
  }

  // Sync local photos with PocketBase
  async syncLocalPhotos(localPhotos) {
    if (!this.isAuthenticated) {
      return {
        success: false,
        error: 'User not authenticated',
        syncResults: []
      };
    }

    const syncResults = [];
    
    for (const localPhoto of localPhotos) {
      // Skip if photo already has pbId (already synced)
      if (localPhoto.pbId) {
        syncResults.push({
          localId: localPhoto.id,
          status: 'already_synced',
          pbId: localPhoto.pbId
        });
        continue;
      }

      try {
        const result = await this.uploadPhoto(localPhoto, localPhoto.caption || '');
        
        if (result.success) {
          syncResults.push({
            localId: localPhoto.id,
            status: 'synced',
            pbId: result.photo.pbId,
            photo: result.photo
          });
        } else {
          syncResults.push({
            localId: localPhoto.id,
            status: 'failed',
            error: result.error
          });
        }
      } catch (error) {
        syncResults.push({
          localId: localPhoto.id,
          status: 'failed',
          error: error.message
        });
      }

      // Add small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successful = syncResults.filter(r => r.status === 'synced').length;
    const failed = syncResults.filter(r => r.status === 'failed').length;
    const alreadySynced = syncResults.filter(r => r.status === 'already_synced').length;

    return {
      success: true,
      syncResults,
      summary: {
        total: localPhotos.length,
        successful,
        failed,
        alreadySynced
      }
    };
  }

  // Merge local and remote photos, handling sync status
  async getMergedPhotos(localPhotos = []) {
    // Get remote photos
    const remoteResult = await this.getUserPhotos();
    const remotePhotos = remoteResult.success ? remoteResult.photos : [];

    // Create map of remote photos by their original local ID (if available)
    const remotePhotoMap = new Map();
    remotePhotos.forEach(photo => {
      if (photo.originalLocalId) {
        remotePhotoMap.set(photo.originalLocalId, photo);
      }
    });

    // Merge local and remote photos
    const mergedPhotos = [];
    const processedLocalIds = new Set();

    // Process local photos first
    localPhotos.forEach(localPhoto => {
      const remotePhoto = remotePhotoMap.get(localPhoto.id);
      
      if (remotePhoto) {
        // Photo exists both locally and remotely - mark as synced
        mergedPhotos.push({
          ...localPhoto,
          pbId: remotePhoto.pbId,
          syncStatus: 'synced',
          remoteUrl: remotePhoto.remoteUrl,
          remoteCreated: remotePhoto.created,
          remoteUpdated: remotePhoto.updated
        });
      } else {
        // Photo exists only locally - mark as local only
        mergedPhotos.push({
          ...localPhoto,
          syncStatus: 'local_only'
        });
      }
      
      processedLocalIds.add(localPhoto.id);
    });

    // Add remote-only photos (uploaded from other devices)
    remotePhotos.forEach(remotePhoto => {
      if (!remotePhoto.originalLocalId || !processedLocalIds.has(remotePhoto.originalLocalId)) {
        mergedPhotos.push({
          ...remotePhoto,
          syncStatus: 'remote_only'
        });
      }
    });

    // Sort by timestamp (newest first)
    mergedPhotos.sort((a, b) => {
      const aTime = new Date(a.timestamp || a.created || 0).getTime();
      const bTime = new Date(b.timestamp || b.created || 0).getTime();
      return bTime - aTime;
    });

    return mergedPhotos;
  }

  // Format PocketBase record to match local photo format
  _formatPhotoRecord(record, originalLocalPhoto = null) {
    const photoUrl = this.getPhotoUrl(record);
    const thumbUrl = this.getPhotoUrl(record, '300x0');
    
    return {
      id: originalLocalPhoto?.id || record.id, // Keep original local ID if available
      pbId: record.id, // PocketBase ID
      originalLocalId: originalLocalPhoto?.id, // Store reference to original local ID
      data: photoUrl, // Use PocketBase URL instead of base64
      remoteUrl: photoUrl,
      thumbUrl,
      caption: record.caption || '',
      timestamp: originalLocalPhoto?.timestamp || record.created,
      width: originalLocalPhoto?.width || null,
      height: originalLocalPhoto?.height || null,
      created: record.created,
      updated: record.updated,
      userId: record.user,
      syncStatus: 'synced'
    };
  }
}

// Create singleton instance
export const photoService = new PhotoService();
export default photoService;