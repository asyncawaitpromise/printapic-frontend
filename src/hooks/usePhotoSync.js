import { useState, useEffect, useCallback } from 'react';
import { photoService } from '../services/photoService';
import { authService } from '../services/authService';

/**
 * Hook for background photo synchronization
 * Automatically syncs local photos when user is authenticated
 */
export const usePhotoSync = (photos = [], options = {}) => {
  const {
    autoSync = true,
    syncInterval = 60000, // 1 minute
    maxRetries = 3,
    onSyncComplete = null,
    onSyncError = null
  } = options;

  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get photos that need syncing (only local_only photos as fallback)
  const getPhotosToSync = useCallback(() => {
    return photos.filter(photo => 
      photo.syncStatus === 'local_only' &&
      photo.hasLocal && 
      photo.data && 
      photo.data.startsWith('data:image/')
    );
  }, [photos]);

  // Sync photos to PocketBase
  const syncPhotos = useCallback(async (photosToSync = null) => {
    if (!authService.isAuthenticated) {
      console.log('🔄 Not authenticated, skipping sync');
      return { success: false, error: 'Not authenticated' };
    }

    const targetPhotos = photosToSync || getPhotosToSync();
    
    if (targetPhotos.length === 0) {
      console.log('🔄 No photos to sync');
      return { success: true, synced: 0 };
    }

    console.log(`🔄 Starting sync of ${targetPhotos.length} photos`);
    setSyncStatus('syncing');
    setSyncProgress({ current: 0, total: targetPhotos.length });

    try {
      const result = await photoService.syncLocalPhotos(targetPhotos);
      
      if (result.success) {
        console.log(`🔄 Sync completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
        setSyncStatus('success');
        setLastSyncTime(new Date());
        setRetryCount(0);
        
        if (onSyncComplete) {
          onSyncComplete(result);
        }
        
        // Clear status after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
        
        return { success: true, synced: result.summary.successful, result };
      } else {
        throw new Error('Sync operation failed');
      }
    } catch (error) {
      console.error('🔄 Sync failed:', error);
      setSyncStatus('error');
      
      if (onSyncError) {
        onSyncError(error);
      }
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying sync in 30 seconds (${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          syncPhotos(targetPhotos);
        }, 30000);
      } else {
        console.log('🔄 Max retries reached, giving up');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
      
      return { success: false, error: error.message };
    } finally {
      setSyncProgress({ current: 0, total: 0 });
    }
  }, [authService.isAuthenticated, getPhotosToSync, maxRetries, retryCount, onSyncComplete, onSyncError]);

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    return syncPhotos();
  }, [syncPhotos]);

  // Background sync effect - only for fallback scenarios
  useEffect(() => {
    if (!autoSync || !authService.isAuthenticated) {
      return;
    }

    const photosToSync = getPhotosToSync();
    
    // Only run background sync if there are local_only photos that need syncing
    if (photosToSync.length > 0 && syncStatus === 'idle') {
      console.log(`🔄 Background sync: ${photosToSync.length} local photos pending`);
      
      // Immediate sync for recent local photos (could be from offline usage)
      const recentPhotos = photosToSync.filter(photo => {
        const photoTime = new Date(photo.timestamp || photo.created || 0);
        const now = new Date();
        const diffMinutes = (now - photoTime) / (1000 * 60);
        return diffMinutes < 5; // Sync photos from last 5 minutes immediately
      });

      if (recentPhotos.length > 0) {
        console.log(`🔄 Immediate sync for ${recentPhotos.length} recent local photos`);
        syncPhotos(recentPhotos);
      }
    }
  }, [autoSync, authService.isAuthenticated, getPhotosToSync, syncPhotos, syncStatus]);

  // Periodic sync interval - only for fallback scenarios
  useEffect(() => {
    if (!autoSync || !authService.isAuthenticated || syncInterval <= 0) {
      return;
    }

    const interval = setInterval(() => {
      const photosToSync = getPhotosToSync();
      
      // Only sync if there are local_only photos that need uploading
      if (photosToSync.length > 0 && syncStatus === 'idle') {
        console.log(`🔄 Periodic sync: ${photosToSync.length} local photos pending`);
        syncPhotos();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, authService.isAuthenticated, syncInterval, getPhotosToSync, syncPhotos, syncStatus]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthChange((token, model) => {
      if (token && model) {
        console.log('🔄 User authenticated, checking for local photos to sync');
        const photosToSync = getPhotosToSync();
        if (photosToSync.length > 0) {
          console.log(`🔄 Found ${photosToSync.length} local photos to sync after authentication`);
          // Small delay to allow components to settle
          setTimeout(() => {
            syncPhotos();
          }, 2000);
        }
      } else {
        console.log('🔄 User signed out, stopping sync');
        setSyncStatus('idle');
        setRetryCount(0);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [getPhotosToSync, syncPhotos]);

  // Network status monitoring - sync local photos when back online
  useEffect(() => {
    const handleOnline = () => {
      console.log('🔄 Back online, checking for local photos to sync');
      if (authService.isAuthenticated) {
        const photosToSync = getPhotosToSync();
        if (photosToSync.length > 0 && syncStatus === 'idle') {
          console.log(`🔄 Found ${photosToSync.length} local photos to sync after coming online`);
          // Small delay to ensure connection is stable
          setTimeout(() => {
            syncPhotos();
          }, 3000);
        }
      }
    };

    const handleOffline = () => {
      console.log('🔄 Offline, pausing sync');
      setSyncStatus('idle');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authService.isAuthenticated, getPhotosToSync, syncPhotos, syncStatus]);

  return {
    // Status
    syncStatus,
    syncProgress,
    lastSyncTime,
    retryCount,
    
    // Counters
    photosToSyncCount: getPhotosToSync().length,
    isOnline: navigator.onLine,
    canSync: authService.isAuthenticated && navigator.onLine,
    
    // Actions
    triggerSync,
    
    // Utils
    getPhotosToSync
  };
};