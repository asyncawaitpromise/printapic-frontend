import React, { useState } from 'react';
import { X, Trash2, Check, AlertCircle, Settings, Edit3, Star, Camera, Layers, Aperture, PenTool } from 'react-feather';
import StickerProcessingStatus from './StickerProcessingStatus';
import { usePhotoProcessing } from '../hooks/usePhotoProcessing';
import { PROMPT_STYLES } from '../data/workflowData';

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
  
  const {
    workflows,
    startProcessing,
    error: processingError
  } = usePhotoProcessing();
  
  if (!isOpen || !photo) return null;

  const photoIndex = photos.findIndex(p => p.id === photo.id);

  // Helper function to start AI processing with prompt key
  const handleArtisticEffect = async (promptKey) => {
    try {
      const aiStyleWorkflow = workflows.find(w => w.id === 'ai_style_transfer');
      if (aiStyleWorkflow) {
        await startProcessing(photo.id, 'ai_style_transfer', { promptKey });
      }
    } catch (err) {
      console.error('Failed to start artistic effect:', err);
    }
  };

  // Helper function to start other workflows
  const handleWorkflowEffect = async (workflowId) => {
    try {
      await startProcessing(photo.id, workflowId);
    } catch (err) {
      console.error('Failed to start workflow:', err);
    }
  };

  // Create artistic editing options - mix of original functionality and new workflows
  const editingOptions = [
    // Original sticker functionality (keep working as before)
    {
      id: 'sticker',
      label: 'Sticker-ify',
      icon: Layers,
      action: () => onConvertToSticker(photo),
      disabled: isProcessing || (!photo.pbId && !photo.hasRemote),
      className: 'btn-primary',
      tooltip: photo.pbId || photo.hasRemote ? 'Convert to sticker with transparent background' : 'Photo must be synced to cloud first'
    },
    // New AI artistic effects (only if workflows are loaded)
    ...(workflows.length > 0 ? PROMPT_STYLES.filter(style => style.key !== 'sticker').map(style => {
      const iconMap = {
        'line-art': PenTool,
        'van-gogh': Aperture,
        'manga-style': Camera,
        'oil-painting': Star
      };
      
      return {
        id: style.key,
        label: style.name,
        icon: iconMap[style.key] || Edit3,
        action: () => handleArtisticEffect(style.key),
        disabled: isProcessing || (!photo.pbId && !photo.hasRemote),
        className: 'btn-secondary',
        tooltip: style.description
      };
    }) : []),
    // Other workflow-based effects (only if workflows are loaded)
    ...(workflows.length > 0 ? workflows.filter(w => w.id !== 'ai_style_transfer').map(workflow => {
      const iconMap = {
        'remove_background': Layers,
        'enhance_colors': Star,
        'vintage_filter': Camera
      };
      
      return {
        id: workflow.id,
        label: workflow.name,
        icon: iconMap[workflow.id] || Edit3,
        action: () => handleWorkflowEffect(workflow.id),
        disabled: isProcessing || (!photo.pbId && !photo.hasRemote),
        className: 'btn-accent',
        tooltip: workflow.description
      };
    }) : [])
  ];

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
            <h4 className="font-semibold text-md">Artistic Effects</h4>
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
              {processingError && (
                <div className="alert alert-error mb-3">
                  <AlertCircle size={16} />
                  <span className="text-sm">{processingError}</span>
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
          {(isComplete || hasError) && (
            <button 
              className="btn btn-sm btn-outline gap-2"
              onClick={onReset}
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