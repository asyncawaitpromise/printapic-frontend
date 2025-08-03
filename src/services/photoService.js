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
      formData.append('originalLocalId', photoData.id);
      formData.append('timestamp', photoData.timestamp);
      formData.append('width', photoData.width || '');
      formData.append('height', photoData.height || '');

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
      throw new Error(error.message || 'Failed to delete photo from cloud');
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

    // Create multiple maps for matching photos
    const remoteByPbId = new Map();
    const remoteByOriginalId = new Map();
    const remoteByTimestamp = new Map();
    const processedRemoteIds = new Set();
    
    remotePhotos.forEach(photo => {
      // Map by pbId for direct matching
      remoteByPbId.set(photo.pbId, photo);
      
      // Map by originalLocalId if available
      if (photo.originalLocalId) {
        remoteByOriginalId.set(photo.originalLocalId, photo);
      }
      // Map by timestamp as fallback (within 1 second tolerance)
      if (photo.timestamp || photo.created) {
        const timestamp = photo.timestamp || photo.created;
        const timeKey = Math.floor(new Date(timestamp).getTime() / 1000);
        if (!remoteByTimestamp.has(timeKey)) {
          remoteByTimestamp.set(timeKey, []);
        }
        remoteByTimestamp.get(timeKey).push(photo);
      }
    });

    // Helper function to find matching remote photo
    const findMatchingRemote = (localPhoto) => {
      // First priority: exact pbId match (most reliable)
      if (localPhoto.pbId && remoteByPbId.has(localPhoto.pbId)) {
        return remoteByPbId.get(localPhoto.pbId);
      }
      
      // Second priority: exact originalLocalId match
      if (remoteByOriginalId.has(localPhoto.id)) {
        return remoteByOriginalId.get(localPhoto.id);
      }
      
      // Fallback: try timestamp match (within 5 seconds tolerance for network delays)
      if (localPhoto.timestamp) {
        const localTime = new Date(localPhoto.timestamp).getTime();
        
        // Check candidates within 5 second window
        for (let i = -5; i <= 5; i++) {
          const timeKey = Math.floor((localTime + (i * 1000)) / 1000);
          const candidates = remoteByTimestamp.get(timeKey);
          if (candidates) {
            // If multiple candidates, try to match by dimensions
            if (candidates.length === 1) {
              return candidates[0];
            } else if (localPhoto.width && localPhoto.height) {
              const dimensionMatch = candidates.find(c => 
                c.width == localPhoto.width && c.height == localPhoto.height
              );
              if (dimensionMatch) return dimensionMatch;
            }
            // Return first candidate if no better match
            return candidates[0];
          }
        }
      }
      
      // Last resort: try matching by dimensions and approximate file size
      if (localPhoto.width && localPhoto.height && localPhoto.data) {
        const dataSize = localPhoto.data.length;
        const match = remotePhotos.find(remote => {
          // Skip already processed photos
          if (processedRemoteIds.has(remote.pbId)) return false;
          
          // Match by dimensions (if available)
          const dimensionMatch = remote.width == localPhoto.width && 
                                 remote.height == localPhoto.height;
          
          // Rough timestamp proximity (within 1 minute)
          let timeMatch = false;
          if (localPhoto.timestamp && remote.timestamp) {
            const timeDiff = Math.abs(
              new Date(localPhoto.timestamp).getTime() - 
              new Date(remote.timestamp).getTime()
            );
            timeMatch = timeDiff < 60000; // 1 minute
            
          } else if (localPhoto.timestamp && remote.created) {
            const timeDiff = Math.abs(
              new Date(localPhoto.timestamp).getTime() - 
              new Date(remote.created).getTime()
            );
            timeMatch = timeDiff < 60000; // 1 minute
          }
          
          return dimensionMatch && timeMatch;
        });
        
        if (match) return match;
      }
      
      return null;
    };

    // Merge local and remote photos
    const mergedPhotos = [];

    // Process local photos first
    localPhotos.forEach(localPhoto => {
      const remotePhoto = findMatchingRemote(localPhoto);
      
      if (remotePhoto) {
        // Photo exists both locally and remotely - mark as synced
        mergedPhotos.push({
          ...localPhoto,
          pbId: remotePhoto.pbId,
          syncStatus: 'synced',
          hasLocal: true,
          hasRemote: true,
          remoteUrl: remotePhoto.remoteUrl,
          remoteCreated: remotePhoto.created,
          remoteUpdated: remotePhoto.updated
        });
        processedRemoteIds.add(remotePhoto.pbId);
      } else {
        // Photo exists only locally - mark as local only
        mergedPhotos.push({
          ...localPhoto,
          syncStatus: 'local_only',
          hasLocal: true,
          hasRemote: false
        });
      }
    });

    // Add remote-only photos (uploaded from other devices)
    remotePhotos.forEach(remotePhoto => {
      // Skip if we already processed this remote photo when matching with local
      if (processedRemoteIds.has(remotePhoto.pbId)) {
        return;
      }
      
      // This is a remote-only photo (uploaded from another device or local was deleted)
      mergedPhotos.push({
        ...remotePhoto,
        syncStatus: 'remote_only',
        hasLocal: false,
        hasRemote: true
      });
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
      id: originalLocalPhoto?.id || record.originalLocalId || `remote_${record.id}`, // Use local ID if available, otherwise create unique remote ID
      pbId: record.id, // PocketBase ID
      originalLocalId: record.originalLocalId || originalLocalPhoto?.id, // Store reference to original local ID
      data: originalLocalPhoto?.data || photoUrl, // Prefer local base64, fallback to remote URL
      remoteUrl: photoUrl,
      thumbUrl,
      caption: record.caption || '',
      timestamp: record.timestamp || originalLocalPhoto?.timestamp || record.created,
      width: record.width || originalLocalPhoto?.width || null,
      height: record.height || originalLocalPhoto?.height || null,
      created: record.created,
      updated: record.updated,
      userId: record.user,
      syncStatus: originalLocalPhoto ? 'synced' : 'remote_only',
      hasLocal: !!originalLocalPhoto,
      hasRemote: true
    };
  }
}

// Create singleton instance
export const photoService = new PhotoService();
export default photoService;