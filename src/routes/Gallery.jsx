import React, { useState, useEffect, useCallback } from 'react';
import { Image, Camera as CameraIcon, CheckSquare, Square, Cloud, RefreshCw, AlertCircle } from 'react-feather';
import { useNavigate, Link } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import ExpandedPhotoModal from '../components/ExpandedPhotoModal';
import PhotoStats from '../components/PhotoStats';
import { useMobilePhotoSelection } from '../hooks/useMobilePhotoSelection';
import { usePhotoSync } from '../hooks/usePhotoSync';
import { useStickerProcessor } from '../hooks/useStickerProcessor';
import MobileBulkActions from '../components/MobileBulkActions';
import MobilePhotoCard from '../components/MobilePhotoCard';
import MobileStickerCustomizer from '../components/MobileStickerCustomizer';
import { photoService } from '../services/photoService';
import { authService } from '../services/authService';

const Gallery = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [stickerCustomizerOpen, setStickerCustomizerOpen] = useState(false);
  const [selectedPhotoForSticker, setSelectedPhotoForSticker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Sticker processing
  const {
    status: stickerStatus,
    editId: stickerEditId,
    resultUrl: stickerResultUrl,
    error: stickerError,
    progress: stickerProgress,
    message: stickerMessage,
    isProcessing: isStickerProcessing,
    isComplete: isStickerComplete,
    hasError: hasStickerError,
    createSticker,
    reset: resetSticker
  } = useStickerProcessor();
  
  // Multi-select functionality
  const {
    selectedPhotos,
    isSelectionMode,
    toggleSelectionMode,
    togglePhotoSelection,
    handleLongPress,
    clearSelection,
    getSelectedPhotos,
    getSelectionStats,
    isPhotoSelected,
    triggerHapticFeedback
  } = useMobilePhotoSelection(photos, 50);

  // Load and merge photos from localStorage and PocketBase
  const loadPhotos = useCallback(async () => {
    console.log('🖼️ Loading photos...');
    setLoading(true);
    
    try {
      // Load from localStorage first
      const savedPhotos = localStorage.getItem('captured-photos');
      let localPhotos = [];
      
      if (savedPhotos) {
        try {
          localPhotos = JSON.parse(savedPhotos);
          console.log('🖼️ Loaded photos from localStorage:', localPhotos.length, 'photos');
        } catch (e) {
          console.error('🖼️ Error loading photos from localStorage:', e);
        }
      }
      
      // If user is authenticated, merge with PocketBase photos
      if (authService.isAuthenticated) {
        console.log('🖼️ User authenticated, merging with PocketBase photos...');
        const mergedPhotos = await photoService.getMergedPhotos(localPhotos);
        setPhotos(mergedPhotos);
        console.log('🖼️ Merged photos loaded:', mergedPhotos.length, 'total photos');
      } else {
        // Not authenticated, just use local photos with local_only status
        const photosWithStatus = localPhotos.map(photo => ({
          ...photo,
          syncStatus: photo.syncStatus || 'local_only',
          hasLocal: true,
          hasRemote: false
        }));
        setPhotos(photosWithStatus);
        console.log('🖼️ Local photos loaded:', photosWithStatus.length, 'photos');
      }
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('🖼️ Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Background photo sync (moved after loadPhotos definition)
  const {
    syncStatus: backgroundSyncStatus,
    photosToSyncCount,
    lastSyncTime: backgroundLastSyncTime,
    triggerSync: triggerBackgroundSync,
    canSync
  } = usePhotoSync(photos, {
    autoSync: true,
    syncInterval: 60000, // 1 minute
    onSyncComplete: useCallback((result) => {
      console.log('🔄 Background sync completed:', result.summary);
      // Update photos with pbId from sync results instead of reloading
      if (result.summary.successful > 0) {
        setPhotos(prev => prev.map(localPhoto => {
          const syncResult = result.syncResults.find(r => r.localId === localPhoto.id);
          if (syncResult && syncResult.status === 'synced') {
            return {
              ...localPhoto,
              pbId: syncResult.pbId,
              syncStatus: 'synced',
              hasLocal: true,
              hasRemote: true
            };
          }
          return localPhoto;
        }));
      }
    }, []),
    onSyncError: (error) => {
      console.error('🔄 Background sync error:', error);
    }
  });

  // Load photos on component mount and when auth state changes
  useEffect(() => {
    console.log('🖼️ Gallery component mounted');
    loadPhotos();
  }, [loadPhotos]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthChange((token, model) => {
      console.log('🖼️ Auth state changed, reloading photos');
      loadPhotos();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadPhotos]);

  // Save photos to localStorage whenever photos state changes (only local photos)
  useEffect(() => {
    // Only save photos that have local data (base64) to localStorage, but preserve pbId for synced photos
    const localPhotos = photos.filter(photo => 
      photo.hasLocal && photo.data && photo.data.startsWith('data:image/')
    ).map(photo => ({
      ...photo,
      // Ensure pbId is preserved when saving to localStorage
      pbId: photo.pbId || undefined
    }));
    
    // Only update localStorage if there's a meaningful change
    const currentSaved = localStorage.getItem('captured-photos');
    const newSaved = JSON.stringify(localPhotos);
    
    if (currentSaved !== newSaved) {
      localStorage.setItem('captured-photos', newSaved);
      console.log('🖼️ Local photos saved to localStorage:', localPhotos.length, 'photos (with pbId preserved)');
    }
  }, [photos]);

  // Delete photo
  const deletePhoto = async (photoId) => {
    console.log('🗑️ Deleting photo:', photoId);
    
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    
    // If photo is synced to PocketBase, delete from there too
    if (photo.pbId && authService.isAuthenticated) {
      try {
        await photoService.deletePhoto(photo.pbId);
        console.log('🗑️ Photo deleted from PocketBase:', photo.pbId);
      } catch (error) {
        console.error('🗑️ Failed to delete from PocketBase:', error);
        // Continue with local deletion even if remote deletion fails
      }
    }
    
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    // Close expanded view if deleting the expanded photo
    if (expandedPhoto && expandedPhoto.id === photoId) {
      setExpandedPhoto(null);
    }
  };

  // Convert to sticker
  const convertToSticker = async (photo) => {
    console.log('🎯 Converting photo to sticker:', photo);
    
    try {
      // Check if photo is synced to PocketBase
      if (!photo.pbId && !photo.hasRemote) {
        throw new Error('Photo must be synced to cloud before creating sticker. Please sync this photo first.');
      }
      
      // Use PocketBase record ID
      const pocketbaseRecordId = photo.pbId;
      if (!pocketbaseRecordId) {
        throw new Error('PocketBase record ID not found. Please sync this photo first.');
      }
      
      const result = await createSticker(pocketbaseRecordId);
      console.log('🎯 Sticker created successfully:', result);
      
      // Refresh photo list to show the new processed photo
      if (result.status === 'done') {
        await loadPhotos();
        alert('Sticker processing complete! The result has been added to your gallery.');
      }
    } catch (error) {
      console.error('🎯 Failed to create sticker:', error);
      alert(`Failed to create sticker: ${error.message}`);
    }
  };

  // Monitor sticker completion and refresh photos
  useEffect(() => {
    if (isStickerComplete) {
      loadPhotos();
    }
  }, [isStickerComplete, loadPhotos]);

  // Clear all photos
  const clearAllPhotos = () => {
    if (window.confirm(`Are you sure you want to delete all ${photos.length} photos? This action cannot be undone.`)) {
      console.log('🗑️ Clearing all photos');
      setPhotos([]);
      setExpandedPhoto(null);
    }
  };

  // Expand photo
  const expandPhoto = (photo) => {
    setExpandedPhoto(photo);
  };

  // Close expanded photo
  const closeExpandedPhoto = () => {
    setExpandedPhoto(null);
  };

  // Bulk action handlers
  const handleDeleteSelected = async (selectedPhotos) => {
    const photoIds = selectedPhotos.map(p => p.id);
    console.log('🗑️ Bulk deleting photos:', photoIds);
    
    // Delete from PocketBase if photos are synced
    if (authService.isAuthenticated) {
      const syncedPhotos = selectedPhotos.filter(p => p.pbId);
      for (const photo of syncedPhotos) {
        try {
          await photoService.deletePhoto(photo.pbId);
          console.log('🗑️ Bulk deleted from PocketBase:', photo.pbId);
        } catch (error) {
          console.error('🗑️ Failed to bulk delete from PocketBase:', error);
        }
      }
    }
    
    setPhotos(prev => prev.filter(photo => !photoIds.includes(photo.id)));
    clearSelection();
    triggerHapticFeedback('success');
  };

  const handleShareSelected = async (selectedPhotos) => {
    console.log('📤 Sharing photos:', selectedPhotos.length);
    
    if (navigator.share) {
      try {
        // Create files from base64 data
        const files = selectedPhotos.map((photo, index) => {
          const byteCharacters = atob(photo.data.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          return new File([byteArray], `photo_${index + 1}.jpg`, { type: 'image/jpeg' });
        });

        await navigator.share({
          title: `${selectedPhotos.length} Photos from Print A Pic`,
          files: files
        });
        
        triggerHapticFeedback('success');
      } catch (error) {
        console.error('Error sharing photos:', error);
        triggerHapticFeedback('error');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      alert('Sharing is not supported on this device');
    }
  };

  const handleDownloadSelected = async (selectedPhotos) => {
    console.log('💾 Downloading photos:', selectedPhotos.length);
    
    selectedPhotos.forEach((photo, idx) => {
      const link = document.createElement('a');
      link.href = photo.data;

      // Generate a unique, readable filename using the photo timestamp + an index suffix
      // Example: photo_2024-07-04T12-34-56.789Z_aa1.jpg  (invalid characters like ':' removed)
      const isoString = new Date(photo.timestamp).toISOString();
      const sanitizedTimestamp = isoString.replace(/[:]/g, '-');

      // If the photo has an id, use part of it to guarantee uniqueness; otherwise fall back to the loop index.
      const uniqueSuffix = photo.id ? photo.id.toString().slice(-4) : idx + 1;

      link.download = `photo_${sanitizedTimestamp}_${uniqueSuffix}.jpg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    
    triggerHapticFeedback('success');
  };

  const handleConvertToStickers = async (selectedPhotos) => {
    console.log('🎯 Converting photos to stickers:', selectedPhotos.length);
    
    // Placeholder for sticker conversion
    alert(`Converting ${selectedPhotos.length} photos to stickers - This feature will be implemented later!`);
    triggerHapticFeedback('success');
  };

  const handlePhotoView = (photo) => {
    if (!isSelectionMode) {
      expandPhoto(photo);
    }
  };

  const handlePhotoMakeSticker = (photo) => {
    setSelectedPhotoForSticker(photo);
    setStickerCustomizerOpen(true);
  };

  const handleStickerCustomizerClose = () => {
    setStickerCustomizerOpen(false);
    setSelectedPhotoForSticker(null);
  };

  const handleStickerCustomizerComplete = (processedPhoto) => {
    // Add the processed photo to the gallery
    setPhotos(prev => [processedPhoto, ...prev]);
    console.log('🎨 Processed photo added to gallery:', processedPhoto.id);
  };

  // Refresh photos from PocketBase
  const refreshPhotos = useCallback(async () => {
    if (!authService.isAuthenticated) {
      console.log('🖼️ Not authenticated, skipping refresh');
      return;
    }
    
    setSyncStatus('syncing');
    await loadPhotos();
    setSyncStatus('success');
    
    setTimeout(() => {
      setSyncStatus('idle');
    }, 2000);
  }, [loadPhotos]);

  // Sync all local photos to PocketBase
  const syncAllLocalPhotos = useCallback(async () => {
    if (!authService.isAuthenticated) {
      alert('Please sign in to sync photos');
      return;
    }

    const localOnlyPhotos = photos.filter(p => p.syncStatus === 'local_only' && p.hasLocal);
    
    if (localOnlyPhotos.length === 0) {
      alert('All photos are already synced!');
      return;
    }

    try {
      setSyncStatus('syncing');
      
      const result = await photoService.syncLocalPhotos(localOnlyPhotos);
      
      if (result.success) {
        // Reload photos to get updated sync status
        await loadPhotos();
        setSyncStatus('success');
        alert(`Successfully synced ${result.summary.successful} photos!`);
      } else {
        setSyncStatus('error');
        alert('Failed to sync photos');
      }
    } catch (error) {
      console.error('Failed to sync photos:', error);
      setSyncStatus('error');
      alert(`Sync failed: ${error.message}`);
    }
    
    setTimeout(() => {
      setSyncStatus('idle');
    }, 3000);
  }, [photos, loadPhotos]);

  return (
    <div className="min-h-screen bg-base-100 pb-20">

      {/* Gallery Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Your Photos</h2>
              <div className="flex items-center gap-2">
                {authService.isAuthenticated && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={refreshPhotos}
                      className={`btn btn-sm btn-ghost gap-1 ${
                        syncStatus === 'syncing' ? 'loading' : ''
                      }`}
                      disabled={syncStatus === 'syncing'}
                      title="Refresh from cloud"
                    >
                      {syncStatus === 'syncing' ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <RefreshCw size={14} />
                      )}
                    </button>
                    
                    {photosToSyncCount > 0 && (
                      <button
                        onClick={triggerBackgroundSync}
                        className={`btn btn-sm btn-ghost gap-1 ${
                          backgroundSyncStatus === 'syncing' ? 'loading' : ''
                        }`}
                        disabled={!canSync || backgroundSyncStatus === 'syncing'}
                        title={`Sync ${photosToSyncCount} pending photos`}
                      >
                        {backgroundSyncStatus === 'syncing' ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Cloud size={14} />
                        )}
                        <span className="badge badge-warning badge-xs">
                          {photosToSyncCount}
                        </span>
                      </button>
                    )}
                  </div>
                )}
                {photos.length > 0 && (
                  <button
                    onClick={toggleSelectionMode}
                    className={`btn btn-sm gap-2 ${isSelectionMode ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {isSelectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
                    {isSelectionMode ? 'Exit Select' : 'Select'}
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm sm:text-base text-base-content/70">
                {loading 
                  ? 'Loading photos...'
                  : photos.length === 0 
                    ? 'No photos captured yet. Take your first photo to get started!'
                    : isSelectionMode 
                      ? `Select photos for bulk actions. ${getSelectionStats().selectedCount} selected.`
                      : `${photos.length} photo${photos.length !== 1 ? 's' : ''} ready for customization.`
                }
              </p>
              {authService.isAuthenticated && (lastSyncTime || backgroundLastSyncTime) && (
                <p className="text-xs text-base-content/50 flex items-center gap-2">
                  Last synced: {(backgroundLastSyncTime || lastSyncTime).toLocaleTimeString()}
                  {backgroundSyncStatus === 'syncing' && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                  {photosToSyncCount > 0 && (
                    <span className="badge badge-warning badge-xs">
                      {photosToSyncCount} pending
                    </span>
                  )}
                </p>
              )}
              {!authService.isAuthenticated && photos.some(p => p.syncStatus === 'local_only') && (
                <div className="alert alert-warning py-2">
                  <AlertCircle size={16} />
                  <span className="text-sm">
                    <Link to="/signin" className="link">Sign in</Link> to sync your photos to the cloud
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center py-12 sm:py-16">
                <span className="loading loading-spinner loading-lg mx-auto mb-4"></span>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Loading Photos</h3>
                <p className="text-sm sm:text-base text-base-content/70">
                  {authService.isAuthenticated ? 'Syncing with cloud...' : 'Loading local photos...'}
                </p>
              </div>
            </div>
          ) : photos.length === 0 ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center py-12 sm:py-16">
                <Image size={48} className="sm:w-16 sm:h-16 mx-auto mb-4 text-base-content/30" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No Photos Yet</h3>
                <p className="text-sm sm:text-base text-base-content/70 mb-6">
                  Take your first photo to get started with creating amazing stickers!
                </p>
                <Link to="/camera" className="btn btn-primary gap-2">
                  <CameraIcon size={18} className="sm:w-5 sm:h-5" />
                  Take a Photo
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <PhotoStats photos={photos} />

              {/* Photo grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {photos.map((photo, index) => (
                  <MobilePhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    isSelected={isPhotoSelected(photo.id)}
                    isSelectionMode={isSelectionMode}
                    onToggleSelection={togglePhotoSelection}
                    onLongPress={handleLongPress}
                    onView={handlePhotoView}
                    onMakeSticker={handlePhotoMakeSticker}
                  />
                ))}
              </div>

              {/* Action buttons at bottom */}
              <div className="mt-6 sm:mt-8 text-center">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link to="/camera" className="btn btn-primary btn-sm sm:btn-lg gap-2">
                    <CameraIcon size={16} className="sm:w-5 sm:h-5" />
                    Take More Photos
                  </Link>
                  
                  {authService.isAuthenticated && photos.some(p => p.hasLocal && !p.hasRemote) && (
                    <button 
                      className="btn btn-outline btn-sm sm:btn-lg gap-2"
                      onClick={() => {
                        // Use background sync if available, otherwise fallback to manual sync
                        if (canSync && triggerBackgroundSync) {
                          triggerBackgroundSync();
                        } else {
                          syncAllLocalPhotos();
                        }
                      }}
                      disabled={syncStatus === 'syncing' || backgroundSyncStatus === 'syncing'}
                    >
                      {(syncStatus === 'syncing' || backgroundSyncStatus === 'syncing') ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <Cloud size={16} className="sm:w-5 sm:h-5" />
                      )}
                      Sync All to Cloud
                    </button>
                  )}
                  
                  <button 
                    className="btn btn-outline btn-sm sm:btn-lg"
                    onClick={() => {
                      const selectedPhotos = photos.slice(0, 5); // Example: select first 5 photos
                      alert(`Batch processing ${selectedPhotos.length} photos - This feature will be implemented later!`);
                    }}
                  >
                    Batch Convert to Stickers
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Expanded Photo Modal */}
      <ExpandedPhotoModal
        photo={expandedPhoto}
        photos={photos}
        isOpen={!!expandedPhoto}
        onClose={closeExpandedPhoto}
        onDelete={deletePhoto}
        onConvertToSticker={convertToSticker}
        stickerProcessing={{
          isProcessing: isStickerProcessing,
          isComplete: isStickerComplete,
          hasError: hasStickerError,
          error: stickerError,
          progress: stickerProgress,
          message: stickerMessage,
          resultUrl: stickerResultUrl,
          onReset: resetSticker
        }}
      />
      
      {/* Mobile Bulk Actions */}
      {isSelectionMode && (
        <MobileBulkActions
          selectedPhotos={getSelectedPhotos()}
          onDeleteSelected={handleDeleteSelected}
          onShareSelected={handleShareSelected}
          onDownloadSelected={handleDownloadSelected}
          onConvertToStickers={handleConvertToStickers}
          onClearSelection={clearSelection}
        />
      )}

      {/* Mobile Sticker Customizer */}
      <MobileStickerCustomizer
        photo={selectedPhotoForSticker}
        isOpen={stickerCustomizerOpen}
        onClose={handleStickerCustomizerClose}
        onComplete={handleStickerCustomizerComplete}
      />

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default Gallery;