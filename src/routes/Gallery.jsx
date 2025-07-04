import React, { useState, useEffect } from 'react';
import { Image, Trash2, Check, ArrowLeft, Camera as CameraIcon, X, Maximize2, CheckSquare, Square } from 'react-feather';
import { useNavigate, Link } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { useMobilePhotoSelection } from '../hooks/useMobilePhotoSelection';
import MobileBulkActions from '../components/MobileBulkActions';
import MobilePhotoCard from '../components/MobilePhotoCard';
import MobileStickerCustomizer from '../components/MobileStickerCustomizer';

const Gallery = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [stickerCustomizerOpen, setStickerCustomizerOpen] = useState(false);
  const [selectedPhotoForSticker, setSelectedPhotoForSticker] = useState(null);
  
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

  // Load photos from localStorage on component mount
  useEffect(() => {
    console.log('🖼️ Gallery component mounted');
    const savedPhotos = localStorage.getItem('captured-photos');
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(savedPhotos);
        console.log('🖼️ Loaded photos from localStorage:', parsedPhotos.length, 'photos');
        setPhotos(parsedPhotos);
      } catch (e) {
        console.error('🖼️ Error loading photos from localStorage:', e);
      }
    } else {
      console.log('🖼️ No saved photos found in localStorage');
    }
  }, []);

  // Save photos to localStorage whenever photos state changes
  useEffect(() => {
    localStorage.setItem('captured-photos', JSON.stringify(photos));
    console.log('🖼️ Photos saved to localStorage:', photos.length, 'photos');
  }, [photos]);

  // Delete photo
  const deletePhoto = (photoId) => {
    console.log('🗑️ Deleting photo:', photoId);
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    // Close expanded view if deleting the expanded photo
    if (expandedPhoto && expandedPhoto.id === photoId) {
      setExpandedPhoto(null);
    }
  };

  // Convert to sticker (placeholder)
  const convertToSticker = (photoId) => {
    console.log('🎯 Converting photo to sticker:', photoId);
    // Placeholder function for future sticker conversion
    alert(`Converting photo ${photoId} to sticker - This feature will be implemented later!`);
  };

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
    
    selectedPhotos.forEach((photo, index) => {
      const link = document.createElement('a');
      link.href = photo.data;
      link.download = `photo_${index + 1}_${new Date(photo.timestamp).toISOString().split('T')[0]}.jpg`;
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

  return (
    <div className="min-h-screen bg-base-100 pb-20">

      {/* Gallery Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Your Photos</h2>
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
            <p className="text-sm sm:text-base text-base-content/70">
              {photos.length === 0 
                ? 'No photos captured yet. Take your first photo to get started!'
                : isSelectionMode 
                  ? `Select photos for bulk actions. ${getSelectionStats().selectedCount} selected.`
                  : `${photos.length} photo${photos.length !== 1 ? 's' : ''} ready for customization.`
              }
            </p>
          </div>

          {photos.length === 0 ? (
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
              <div className="stats shadow mb-4 sm:mb-6 w-full text-xs sm:text-sm">
                <div className="stat py-3 sm:py-4">
                  <div className="stat-title text-xs">Total Photos</div>
                  <div className="stat-value text-lg sm:text-2xl text-primary">{photos.length}</div>
                  <div className="stat-desc text-xs">Captured photos</div>
                </div>
                <div className="stat py-3 sm:py-4">
                  <div className="stat-title text-xs">Storage Used</div>
                  <div className="stat-value text-lg sm:text-2xl text-secondary">
                    {(JSON.stringify(photos).length / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <div className="stat-desc text-xs">In local storage</div>
                </div>
                <div className="stat py-3 sm:py-4">
                  <div className="stat-title text-xs">Latest Photo</div>
                  <div className="stat-value text-lg sm:text-2xl text-accent">
                    {new Date(photos[0]?.timestamp).toLocaleDateString()}
                  </div>
                  <div className="stat-desc text-xs">
                    {new Date(photos[0]?.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

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
      {expandedPhoto && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                Photo #{photos.findIndex(p => p.id === expandedPhoto.id) + 1}
              </h3>
              <button 
                className="btn btn-circle btn-sm"
                onClick={closeExpandedPhoto}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="mb-4">
              <img 
                src={expandedPhoto.data} 
                alt={`Expanded photo ${expandedPhoto.id}`}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="font-semibold">Date:</span> {new Date(expandedPhoto.timestamp).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Time:</span> {new Date(expandedPhoto.timestamp).toLocaleTimeString()}
              </div>
              <div>
                <span className="font-semibold">Dimensions:</span> {expandedPhoto.width}×{expandedPhoto.height}
              </div>
              <div>
                <span className="font-semibold">Size:</span> {(expandedPhoto.data.length / 1024).toFixed(1)}KB
              </div>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-error gap-2"
                onClick={() => {
                  deletePhoto(expandedPhoto.id);
                  closeExpandedPhoto();
                }}
              >
                <Trash2 size={16} />
                Delete Photo
              </button>
              <button 
                className="btn btn-primary gap-2"
                onClick={() => {
                  convertToSticker(expandedPhoto.id);
                  closeExpandedPhoto();
                }}
              >
                <Check size={16} />
                Make Sticker
              </button>
              <button 
                className="btn btn-outline"
                onClick={closeExpandedPhoto}
              >
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeExpandedPhoto}></div>
        </div>
      )}
      
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