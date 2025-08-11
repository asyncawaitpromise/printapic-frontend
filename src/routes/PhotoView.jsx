import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, AlertCircle, Settings, Edit3, Star, Camera, Layers, Aperture, PenTool, ArrowLeft, ArrowRight, ShoppingCart, Briefcase, Sun, Zap, Shield, ChevronLeft, ChevronRight } from 'react-feather';
import { useParams, useNavigate } from 'react-router-dom';
import StickerProcessingStatus from '../components/StickerProcessingStatus';
import AddToOrderModal from '../components/AddToOrderModal';
import { PROMPT_STYLES, TRANSPORT_STYLES } from '../data/workflowData';
import { imageProcessingService } from '../services/imageProcessingService';
import { photoService } from '../services/photoService';
import { authService } from '../services/authService';
import { photoCacheService } from '../services/photoCacheService';
import { useStickerProcessor } from '../hooks/useStickerProcessor';

const PhotoView = () => {
  const { photoId } = useParams();
  const navigate = useNavigate();
  
  const [photo, setPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditingOptions, setShowEditingOptions] = useState(true);
  const [apiProcessingState, setApiProcessingState] = useState({
    isProcessing: false,
    error: null,
    message: '',
    currentEffect: null,
    processingButtons: new Set()
  });
  const [userTokens, setUserTokens] = useState(0);
  const [showAddToOrderModal, setShowAddToOrderModal] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(null);
  
  // Swipe detection state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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

  // Load photos and find the specific photo
  useEffect(() => {
    const loadPhotos = async () => {
      const userId = authService.isAuthenticated ? authService.pb.authStore.model?.id : 'anonymous';
      
      // First, try to load from cache for instant display
      const cachedPhotos = photoCacheService.getPhotos(userId);
      if (cachedPhotos && cachedPhotos.length > 0) {
        console.log('📦 PhotoView: Using cached photos for instant display:', cachedPhotos.length, 'photos');
        setPhotos(cachedPhotos);
        const foundPhoto = cachedPhotos.find(p => p.id === photoId);
        setPhoto(foundPhoto || null);
        setLoading(false);
        return; // Don't fetch fresh data for PhotoView - cache is sufficient
      }
      
      setLoading(true);
      try {
        if (authService.isAuthenticated) {
          const result = await photoService.getUserPhotos();
          if (result.success) {
            // Cache the fresh data
            photoCacheService.setPhotos(result.photos, userId);
            setPhotos(result.photos);
            const foundPhoto = result.photos.find(p => p.id === photoId);
            setPhoto(foundPhoto || null);
          } else {
            console.error('Error loading photos from PocketBase:', result.error);
            loadPhotosFromLocalStorage();
          }
        } else {
          loadPhotosFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading photos:', error);
        loadPhotosFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const loadPhotosFromLocalStorage = () => {
      const savedPhotos = localStorage.getItem('captured-photos');
      let localPhotos = [];
      
      if (savedPhotos) {
        try {
          localPhotos = JSON.parse(savedPhotos);
        } catch (e) {
          console.error('Error loading photos from localStorage:', e);
        }
      }
      
      const photosWithStatus = localPhotos.map(photo => ({
        ...photo,
        syncStatus: 'local_only',
        hasLocal: true,
        hasRemote: false
      }));
      
      setPhotos(photosWithStatus);
      const foundPhoto = photosWithStatus.find(p => p.id === photoId);
      setPhoto(foundPhoto || null);
    };

    loadPhotos();
  }, [photoId]);

  // Load user token balance
  useEffect(() => {
    const loadTokenBalance = async () => {
      try {
        const balance = await imageProcessingService.getUserTokenBalance();
        setUserTokens(balance);
      } catch (error) {
        console.error('Failed to load token balance:', error);
      }
    };

    if (photo) {
      loadTokenBalance();
    }
  }, [photo]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      imageProcessingService.cleanupAll();
    };
  }, []);

  // Clear processing state when navigating to a different photo
  useEffect(() => {
    if (photo?.id) {
      resetApiProcessing();
    }
  }, [photo?.id]);

  // Calculate photo index for navigation
  const photoIndex = photos.findIndex(p => p.id === photo?.id) || 0;
  
  // Swipe navigation functions
  const navigateToPhoto = (newIndex) => {
    if (newIndex >= 0 && newIndex < photos.length) {
      const newPhoto = photos[newIndex];
      navigate(`/photo/${newPhoto.id}`, { replace: true });
    }
  };
  
  const goToPreviousPhoto = () => {
    navigateToPhoto(photoIndex - 1);
  };
  
  const goToNextPhoto = () => {
    navigateToPhoto(photoIndex + 1);
  };

  // Keyboard navigation support - must be after navigation functions are defined
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousPhoto();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photoIndex, photos.length, photo?.id]);

  // Touch event handlers for swipe detection
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      // Swipe left: go to next photo
      goToNextPhoto();
    }
    if (isRightSwipe) {
      // Swipe right: go to previous photo  
      goToPreviousPhoto();
    }
  };

  // Delete photo
  const deletePhoto = async (photoId) => {
    const photoToDelete = photos.find(p => p.id === photoId);
    if (!photoToDelete) return;
    
    if (photoToDelete.pbId && authService.isAuthenticated) {
      try {
        await photoService.deletePhoto(photoToDelete.pbId, photoToDelete.collectionType);
      } catch (error) {
        console.error('Failed to delete from PocketBase:', error);
        alert(`Failed to delete photo from cloud: ${error.message}`);
        return;
      }
    }
    
    // Navigate back to gallery after deletion
    navigate('/gallery');
  };

  // Handle new photo created from artistic effects
  const handleNewPhotoCreated = async (newPhotoRecord) => {
    console.log('New photo created from artistic effect:', newPhotoRecord.id);
    // Could refresh photos here or show a success message
  };

  // Handle artistic effects using the real API
  const handleArtisticEffect = async (promptKey) => {
    if (!photo.pbId) {
      setApiProcessingState({
        isProcessing: false,
        error: 'Photo must be synced to cloud before processing. Please sync this photo first.',
        message: '',
        currentEffect: null
      });
      return;
    }

    const hasTokens = await imageProcessingService.hasEnoughTokens(1);
    if (!hasTokens) {
      setApiProcessingState({
        isProcessing: false,
        error: 'Insufficient tokens. You need 1 token to process this image.',
        message: '',
        currentEffect: null
      });
      return;
    }

    try {
      setApiProcessingState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
        message: 'Starting AI processing...',
        currentEffect: promptKey,
        processingButtons: new Set([...prev.processingButtons, promptKey])
      }));

      const result = await imageProcessingService.processImage(
        photo.pbId, 
        promptKey,
        (statusUpdate) => {
          console.log('Processing status update:', statusUpdate);
          
          if (statusUpdate.status === 'complete') {
            setApiProcessingState(prev => {
              const newProcessingButtons = new Set(prev.processingButtons);
              newProcessingButtons.delete(promptKey);
              return {
                ...prev,
                isProcessing: newProcessingButtons.size > 0,
                error: null,
                message: statusUpdate.message,
                currentEffect: null,
                processingButtons: newProcessingButtons
              };
            });
            
            imageProcessingService.getUserTokenBalance().then(setUserTokens);
            
            if (statusUpdate.newPhotoRecord && handleNewPhotoCreated) {
              handleNewPhotoCreated(statusUpdate.newPhotoRecord);
            }
            
          } else if (statusUpdate.status === 'error') {
            setApiProcessingState(prev => {
              const newProcessingButtons = new Set(prev.processingButtons);
              newProcessingButtons.delete(promptKey);
              return {
                ...prev,
                isProcessing: newProcessingButtons.size > 0,
                error: statusUpdate.message,
                message: '',
                currentEffect: null,
                processingButtons: newProcessingButtons
              };
            });
          } else {
            setApiProcessingState(prev => ({
              ...prev,
              message: statusUpdate.message
            }));
          }
        }
      );

      setApiProcessingState(prev => ({
        ...prev,
        message: result.message
      }));

    } catch (err) {
      console.error('Failed to start artistic effect:', err);
      setApiProcessingState(prev => {
        const newProcessingButtons = new Set(prev.processingButtons);
        newProcessingButtons.delete(promptKey);
        return {
          ...prev,
          isProcessing: newProcessingButtons.size > 0,
          error: err.message,
          message: '',
          currentEffect: null,
          processingButtons: newProcessingButtons
        };
      });
    }
  };

  // Helper to reset API processing state
  const resetApiProcessing = () => {
    setApiProcessingState({
      isProcessing: false,
      error: null,
      message: '',
      currentEffect: null,
      processingButtons: new Set()
    });
    imageProcessingService.cleanupAll();
  };

  // Convert to sticker
  const convertToSticker = async (photo) => {
    try {
      if (!photo.pbId && !photo.hasRemote) {
        throw new Error('Photo must be synced to cloud before creating sticker. Please sync this photo first.');
      }
      
      const pocketbaseRecordId = photo.pbId;
      if (!pocketbaseRecordId) {
        throw new Error('PocketBase record ID not found. Please sync this photo first.');
      }
      
      const result = await createSticker(pocketbaseRecordId);
      
      if (result.status === 'done') {
        alert('Sticker processing complete! The result has been added to your gallery.');
      }
    } catch (error) {
      console.error('Failed to create sticker:', error);
      alert(`Failed to create sticker: ${error.message}`);
    }
  };

  // Handle add to cart success
  const handleAddToCartSuccess = (successData) => {
    setAddToCartSuccess(successData);
    // Clear success message after 3 seconds
    setTimeout(() => setAddToCartSuccess(null), 3000);
  };

  // Get the edit ID for ordering (from completed sticker or other processing)
  const getEditIdForOrdering = () => {
    // If sticker processing is complete and has a result, use the sticker edit ID
    if (isStickerComplete && stickerEditId) {
      return stickerEditId;
    }
    
    // For regular photos without processing, we can use the photo's PB ID as the "edit" ID
    // The ordering system will handle this appropriately
    if (photo.pbId) {
      return photo.pbId;
    }
    
    return null;
  };

  // Any photo can be ordered - no need to check for processing completion
  const hasOrderableEdit = () => {
    return true; // Always allow ordering
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg mb-4"></span>
          <h3 className="text-lg font-semibold">Loading Photo...</h3>
        </div>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Photo Not Found</h3>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/gallery')}
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  // Create artistic editing options using the real API
  const editingOptions = PROMPT_STYLES.map(style => {
    const iconMap = {
      'sticker': Layers,
      'line-art': PenTool,
      'van-gogh': Aperture,
      'manga-style': Camera,
      'oil-painting': Star
    };

    const isThisButtonProcessing = apiProcessingState.processingButtons.has(style.key);
    const isDisabled = isThisButtonProcessing || 
                      isStickerProcessing || 
                      (!photo.pbId && !photo.hasRemote) ||
                      userTokens < 1;

    let tooltip = style.description;
    if (!photo.pbId && !photo.hasRemote) {
      tooltip = 'Photo must be synced to cloud first';
    } else if (userTokens < 1) {
      tooltip = 'Insufficient tokens (1 token required)';
    } else if (isThisButtonProcessing) {
      tooltip = 'Processing in progress...';
    }

    return {
      id: style.key,
      label: style.name,
      icon: iconMap[style.key] || Edit3,
      action: () => {
        handleArtisticEffect(style.key);
      },
      disabled: isDisabled,
      className: style.key === 'sticker' ? 'btn-primary' : 'btn-secondary',
      tooltip: tooltip,
      tokensRequired: 1,
      isProcessing: isThisButtonProcessing
    };
  });

  // Create transport editing options using the same API structure
  const transportOptions = TRANSPORT_STYLES.map(style => {
    const iconMap = {
      'business-photo': Briefcase,
      'beach-vacation': Sun,
      'space-explorer': Zap,
      'medieval-knight': Shield
    };

    const isThisButtonProcessing = apiProcessingState.processingButtons.has(style.key);
    const isDisabled = isThisButtonProcessing || 
                      isStickerProcessing || 
                      (!photo.pbId && !photo.hasRemote) ||
                      userTokens < 1;

    let tooltip = style.description;
    if (!photo.pbId && !photo.hasRemote) {
      tooltip = 'Photo must be synced to cloud first';
    } else if (userTokens < 1) {
      tooltip = 'Insufficient tokens (1 token required)';
    } else if (isThisButtonProcessing) {
      tooltip = 'Processing in progress...';
    }

    return {
      id: style.key,
      label: style.name,
      icon: iconMap[style.key] || Edit3,
      action: () => {
        handleArtisticEffect(style.key);
      },
      disabled: isDisabled,
      className: 'btn-accent',
      tooltip: tooltip,
      tokensRequired: 1,
      isProcessing: isThisButtonProcessing
    };
  });

  return (
    <div className="min-h-screen bg-base-100 pb-20">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-4xl">
        {/* Header with navigation */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button 
              className="btn btn-circle btn-sm"
              onClick={() => navigate('/gallery')}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-bold text-lg">
              Photo #{photoIndex + 1} of {photos.length}
            </h1>
          </div>
          
          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              className={`btn btn-circle btn-sm ${photoIndex === 0 ? 'btn-disabled' : 'btn-ghost'}`}
              onClick={goToPreviousPhoto}
              disabled={photoIndex === 0}
              title="Previous photo (← key)"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className={`btn btn-circle btn-sm ${photoIndex === photos.length - 1 ? 'btn-disabled' : 'btn-ghost'}`}
              onClick={goToNextPhoto}
              disabled={photoIndex === photos.length - 1}
              title="Next photo (→ key)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        {/* Photo with swipe support */}
        <div 
          className="mb-4 touch-manipulation"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img 
            src={photo.data} 
            alt={`Photo ${photo.id}`}
            className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg select-none"
            draggable={false}
          />
          
          {/* Navigation indicators */}
          <div className="flex justify-center mt-2 gap-2">
            {photos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === photoIndex ? 'bg-primary' : 'bg-base-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Photo Metadata - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm bg-base-200 p-3 rounded-lg">
          <div className="flex justify-between sm:block">
            <span className="font-semibold">Date:</span> 
            <span className="sm:block">{new Date(photo.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="font-semibold">Time:</span> 
            <span className="sm:block">{new Date(photo.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="font-semibold">Dimensions:</span> 
            <span className="sm:block">{photo.width}×{photo.height}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="font-semibold">Size:</span> 
            <span className="sm:block">{(photo.data.length / 1024).toFixed(1)}KB</span>
          </div>
        </div>
        
        {/* Add to Cart Success Message */}
        {addToCartSuccess && (
          <div className="alert alert-success mb-4">
            <Check size={16} />
            <span className="text-sm">{addToCartSuccess.message}</span>
          </div>
        )}
        
        {/* Processing Status */}
        <StickerProcessingStatus
          isProcessing={isStickerProcessing}
          isComplete={isStickerComplete}
          hasError={hasStickerError}
          error={stickerError}
          progress={stickerProgress}
          message={stickerMessage}
          resultUrl={stickerResultUrl}
          onAddToOrder={() => setShowAddToOrderModal(true)}
        />
        
        {/* Artistic Effects Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-semibold text-md">Artistic Effects</h4>
              <p className="text-xs text-base-content/60">
                Tokens: {userTokens} | 1 token per effect
              </p>
            </div>
            <button 
              className="btn btn-sm btn-ghost"
              onClick={() => setShowEditingOptions(!showEditingOptions)}
            >
              <Settings size={16} />
              {showEditingOptions ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          {showEditingOptions && (
            <div>
              {apiProcessingState.error && (
                <div className="alert alert-error mb-3">
                  <AlertCircle size={16} />
                  <span className="text-sm">{apiProcessingState.error}</span>
                </div>
              )}
              
              
              {apiProcessingState.message && !apiProcessingState.isProcessing && !apiProcessingState.error && (
                <div className="alert alert-success mb-3">
                  <Check size={16} />
                  <span className="text-sm">{apiProcessingState.message}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {editingOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      className={`btn btn-sm gap-1 ${option.className} ${option.disabled ? 'btn-disabled' : ''} flex-col h-auto py-3 relative`}
                      onClick={option.action}
                      disabled={option.disabled}
                      title={option.tooltip}
                    >
                      {option.isProcessing ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <IconComponent size={16} />
                      )}
                      <span className="text-xs leading-tight text-center">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Transport Effects Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-semibold text-md">Transport Effects</h4>
              <p className="text-xs text-base-content/60">
                Transform your subject into different environments
              </p>
            </div>
          </div>
          
          {showEditingOptions && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {transportOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      className={`btn btn-sm gap-1 ${option.className} ${option.disabled ? 'btn-disabled' : ''} flex-col h-auto py-3 relative`}
                      onClick={option.action}
                      disabled={option.disabled}
                      title={option.tooltip}
                    >
                      {option.isProcessing ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <IconComponent size={16} />
                      )}
                      <span className="text-xs leading-tight text-center">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Processing Status Display */}
          {isStickerProcessing && (
            <div className="mt-3 p-3 bg-base-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span className="text-sm">Processing your photo...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-base-300">
          {/* Reset Button - Only show when needed */}
          {(isStickerComplete || hasStickerError || apiProcessingState.error || apiProcessingState.message) && (
            <button 
              className="btn btn-sm btn-outline gap-2"
              onClick={() => {
                resetSticker();
                resetApiProcessing();
              }}
            >
              Reset
            </button>
          )}
          
          {/* Add to Order Button */}
          {hasOrderableEdit() && (
            <button 
              className="btn btn-sm btn-success gap-2 w-full mb-2"
              onClick={() => setShowAddToOrderModal(true)}
            >
              <ShoppingCart size={16} />
              Add to Order
            </button>
          )}
          
          {/* Primary Actions */}
          <div className="flex gap-2">
            <button 
              className="btn btn-sm btn-error gap-2 flex-1"
              onClick={() => deletePhoto(photo.id)}
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete Photo</span>
              <span className="sm:hidden">Delete</span>
            </button>
            
            <button 
              className="btn btn-sm btn-outline flex-1"
              onClick={() => navigate('/gallery')}
            >
              Back to Gallery
            </button>
          </div>
        </div>
      </div>
      
      {/* Add to Order Modal */}
      <AddToOrderModal
        photo={photo}
        editId={getEditIdForOrdering()}
        isOpen={showAddToOrderModal}
        onClose={() => setShowAddToOrderModal(false)}
        onSuccess={handleAddToCartSuccess}
      />
    </div>
  );
};

export default PhotoView;