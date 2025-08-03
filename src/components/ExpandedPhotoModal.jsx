import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, AlertCircle, Settings, Edit3, Star, Camera, Layers, Aperture, PenTool } from 'react-feather';
import StickerProcessingStatus from './StickerProcessingStatus';
import { PROMPT_STYLES } from '../data/workflowData';
import { imageProcessingService } from '../services/imageProcessingService';

const ExpandedPhotoModal = ({
  photo,
  photos,
  isOpen,
  onClose,
  onDelete,
  onConvertToSticker,
  stickerProcessing: {
    isProcessing,
    isComplete,
    hasError,
    error,
    progress,
    message,
    resultUrl,
    onReset
  }
}) => {
  const [showEditingOptions, setShowEditingOptions] = useState(true);
  const [apiProcessingState, setApiProcessingState] = useState({
    isProcessing: false,
    error: null,
    message: '',
    currentEffect: null
  });
  const [userTokens, setUserTokens] = useState(0);

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

    if (isOpen) {
      loadTokenBalance();
    }
  }, [isOpen]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      imageProcessingService.cleanupAll();
    };
  }, []);
  
  if (!isOpen || !photo) return null;

  const photoIndex = photos.findIndex(p => p.id === photo.id);

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

    // Check token balance
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
      setApiProcessingState({
        isProcessing: true,
        error: null,
        message: 'Starting AI processing...',
        currentEffect: promptKey
      });

      const result = await imageProcessingService.processImage(
        photo.pbId, 
        promptKey,
        (statusUpdate) => {
          console.log('📊 Processing status update:', statusUpdate);
          
          if (statusUpdate.status === 'complete') {
            setApiProcessingState({
              isProcessing: false,
              error: null,
              message: statusUpdate.message,
              currentEffect: null
            });
            
            // Refresh token balance
            imageProcessingService.getUserTokenBalance().then(setUserTokens);
            
            // Optionally trigger a photo gallery refresh
            if (statusUpdate.newPhotoRecord) {
              console.log('🖼️ New photo created:', statusUpdate.newPhotoRecord.id);
            }
            
          } else if (statusUpdate.status === 'error') {
            setApiProcessingState({
              isProcessing: false,
              error: statusUpdate.message,
              message: '',
              currentEffect: null
            });
          } else {
            setApiProcessingState(prev => ({
              ...prev,
              message: statusUpdate.message
            }));
          }
        }
      );

      console.log('✅ Processing started:', result);
      
      setApiProcessingState(prev => ({
        ...prev,
        message: result.message
      }));

    } catch (err) {
      console.error('❌ Failed to start artistic effect:', err);
      setApiProcessingState({
        isProcessing: false,
        error: err.message,
        message: '',
        currentEffect: null
      });
    }
  };

  // Helper to reset API processing state
  const resetApiProcessing = () => {
    setApiProcessingState({
      isProcessing: false,
      error: null,
      message: '',
      currentEffect: null
    });
    imageProcessingService.cleanupAll();
  };

  // Create artistic editing options using the real API
  const editingOptions = PROMPT_STYLES.map(style => {
    const iconMap = {
      'sticker': Layers,
      'line-art': PenTool,
      'van-gogh': Aperture,
      'manga-style': Camera,
      'oil-painting': Star
    };

    const isDisabled = apiProcessingState.isProcessing || 
                      isProcessing || 
                      (!photo.pbId && !photo.hasRemote) ||
                      userTokens < 1;

    let tooltip = style.description;
    if (!photo.pbId && !photo.hasRemote) {
      tooltip = 'Photo must be synced to cloud first';
    } else if (userTokens < 1) {
      tooltip = 'Insufficient tokens (1 token required)';
    } else if (apiProcessingState.isProcessing) {
      tooltip = 'Processing in progress...';
    }

    return {
      id: style.key,
      label: style.name,
      icon: iconMap[style.key] || Edit3,
      action: () => {
        // Use consistent API processing for all effects including sticker
        handleArtisticEffect(style.key);
      },
      disabled: isDisabled,
      className: style.key === 'sticker' ? 'btn-primary' : 'btn-secondary',
      tooltip: tooltip,
      tokensRequired: 1
    };
  });

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-lg sm:max-w-2xl lg:max-w-4xl p-3 sm:p-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 sticky top-0 bg-base-100 z-10 pb-2">
          <h3 className="font-bold text-lg">
            Photo #{photoIndex + 1}
          </h3>
          <button 
            className="btn btn-circle btn-sm"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Photo */}
        <div className="mb-4">
          <img 
            src={photo.data} 
            alt={`Expanded photo ${photo.id}`}
            className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg"
          />
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
        
        {/* Processing Status */}
        <StickerProcessingStatus
          isProcessing={isProcessing}
          isComplete={isComplete}
          hasError={hasError}
          error={error}
          progress={progress}
          message={message}
          resultUrl={resultUrl}
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
              
              {apiProcessingState.isProcessing && (
                <div className="alert alert-info mb-3">
                  <div className="loading loading-spinner loading-sm"></div>
                  <span className="text-sm">
                    {apiProcessingState.message || 'Processing your image...'}
                  </span>
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
                      className={`btn btn-sm gap-1 ${option.className} ${option.disabled ? 'btn-disabled' : ''} flex-col h-auto py-3`}
                      onClick={option.action}
                      disabled={option.disabled}
                      title={option.tooltip}
                    >
                      <IconComponent size={16} />
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
          {isProcessing && (
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
          {(isComplete || hasError || apiProcessingState.error || apiProcessingState.message) && (
            <button 
              className="btn btn-sm btn-outline gap-2"
              onClick={() => {
                onReset();
                resetApiProcessing();
              }}
            >
              Reset
            </button>
          )}
          
          {/* Primary Actions */}
          <div className="flex gap-2">
            <button 
              className="btn btn-sm btn-error gap-2 flex-1"
              onClick={() => {
                onDelete(photo.id);
                onClose();
              }}
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete Photo</span>
              <span className="sm:hidden">Delete</span>
            </button>
            
            <button 
              className="btn btn-sm btn-outline flex-1"
              onClick={() => {
                onClose();
                onReset();
                resetApiProcessing();
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default ExpandedPhotoModal;