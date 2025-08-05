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

  // Get all user's photos from PocketBase (both original photos and processed edits)
  async getUserPhotos() {
    if (!this.isAuthenticated) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const userId = authService.currentUser.id;
      
      // Get original photos
      const photoRecords = await this.pb.collection(this.collectionName).getFullList({
        filter: `user = "${userId}"`,
        sort: '-created',
        expand: 'user'
      });

      // Get processed edits (these are also "photos" from user perspective)
      let editRecords = [];
      try {
        editRecords = await this.pb.collection('printapic_edits').getFullList({
          filter: `user = "${userId}" && status = "done" && result_image != ""`,
          sort: '-created',
          expand: 'user,photo'
        });
      } catch (editError) {
        console.warn('Could not fetch processed edits:', editError.message);
      }

      // Format all records
      const originalPhotos = photoRecords.map(record => this._formatPhotoRecord(record, null, 'photos'));
      const processedPhotos = editRecords.map(record => this._formatEditRecord(record));
      
      // Combine and sort by creation date
      const allPhotos = [...originalPhotos, ...processedPhotos].sort((a, b) => {
        const aTime = new Date(a.created || a.timestamp || 0).getTime();
        const bTime = new Date(b.created || b.timestamp || 0).getTime();
        return bTime - aTime; // Newest first
      });
      
      return {
        success: true,
        photos: allPhotos
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

  // Delete photo from PocketBase (auto-detects collection type)
  async deletePhoto(photoId, collectionType = null) {
    if (!this.isAuthenticated) {
      throw new Error('User must be authenticated to delete photos');
    }

    // If no collection type specified, try to auto-detect
    if (!collectionType) {
      collectionType = await this.detectPhotoCollection(photoId);
    }

    try {
      let collectionName;
      
      // Determine which collection to delete from
      if (collectionType === 'edits') {
        collectionName = 'printapic_edits';
        // For edits, just delete the edit record directly
        await this.pb.collection(collectionName).delete(photoId);
        console.log(`✅ Deleted edit from ${collectionName}:`, photoId);
      } else {
        collectionName = this.collectionName; // 'printapic_photos'
        
        // For photos, we need to delete related edits first (cascade deletion)
        // Find all edits that reference this photo
        try {
          const relatedEdits = await this.pb.collection('printapic_edits').getFullList({
            filter: `photo = "${photoId}"`
          });
          
          // Delete all related edits first
          for (const edit of relatedEdits) {
            await this.pb.collection('printapic_edits').delete(edit.id);
            console.log(`✅ Deleted related edit: ${edit.id}`);
          }
        } catch (editError) {
          console.warn('Could not fetch or delete related edits:', editError.message);
          // Continue with photo deletion even if edit cleanup fails
        }
        
        // Now delete the photo itself
        await this.pb.collection(collectionName).delete(photoId);
        console.log(`✅ Deleted photo from ${collectionName}:`, photoId);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete photo:', error);
      throw new Error(error.message || 'Failed to delete photo from cloud');
    }
  }

  // Auto-detect which collection a photo belongs to
  async detectPhotoCollection(photoId) {
    try {
      // First try printapic_photos
      try {
        await this.pb.collection('printapic_photos').getOne(photoId);
        return 'photos';
      } catch (photoError) {
        // If not found in photos, try edits
        try {
          await this.pb.collection('printapic_edits').getOne(photoId);
          return 'edits';
        } catch (editError) {
          console.warn(`Photo ${photoId} not found in either collection`);
          return 'photos'; // Default fallback
        }
      }
    } catch (error) {
      console.error('Error detecting photo collection:', error);
      return 'photos'; // Default fallback
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
  getPhotoUrl(record, fieldName = 'image', thumb = '500x0') {
    // Handle both image field (for photos) and result_image field (for edits)
    const imageField = fieldName === 'result_image' ? record.result_image : record.image;
    if (!imageField) return null;
    
    return this.pb.files.getURL(record, imageField, { thumb });
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
  _formatPhotoRecord(record, originalLocalPhoto = null, collectionType = 'photos') {
    const photoUrl = this.getPhotoUrl(record);
    const thumbUrl = this.getPhotoUrl(record, '300x0');
    
    return {
      id: originalLocalPhoto?.id || record.originalLocalId || `remote_${record.id}`, // Use local ID if available, otherwise create unique remote ID
      pbId: record.id, // PocketBase ID
      collectionType: collectionType, // Track which collection this belongs to
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

  // Format PocketBase edit record to match local photo format
  _formatEditRecord(record) {
    const photoUrl = this.getPhotoUrl(record, 'result_image');
    const thumbUrl = this.getPhotoUrl(record, 'result_image', '300x0');
    
    return {
      id: `edit_${record.id}`, // Unique ID for processed photos
      pbId: record.id, // PocketBase ID
      collectionType: 'edits', // Mark as processed edit
      originalLocalId: null, // Edits don't have local counterparts
      data: photoUrl, // Use the processed result image
      remoteUrl: photoUrl,
      thumbUrl,
      caption: `Processed: ${record.expand?.photo?.caption || 'Photo'}`, // Indicate it's processed
      timestamp: record.completed || record.created,
      width: null, // Edit records might not have dimensions
      height: null,
      created: record.created,
      updated: record.updated,
      userId: record.user,
      syncStatus: 'remote_only', // Processed photos are always remote
      hasLocal: false,
      hasRemote: true,
      processing: {
        status: record.status,
        tokensUsed: record.tokens_cost
      }
    };
  }
}

// Create singleton instance
export const photoService = new PhotoService();
export default photoService;