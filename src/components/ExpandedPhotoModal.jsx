import React from 'react';
import { X, Trash2, Check, AlertCircle } from 'react-feather';
import StickerProcessingStatus from './StickerProcessingStatus';

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
  if (!isOpen || !photo) return null;

  const photoIndex = photos.findIndex(p => p.id === photo.id);

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl p-4">
        <div className="flex justify-between items-center mb-4">
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
        
        <div className="mb-4">
          <img 
            src={photo.data} 
            alt={`Expanded photo ${photo.id}`}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="font-semibold">Date:</span> {new Date(photo.timestamp).toLocaleDateString()}
          </div>
          <div>
            <span className="font-semibold">Time:</span> {new Date(photo.timestamp).toLocaleTimeString()}
          </div>
          <div>
            <span className="font-semibold">Dimensions:</span> {photo.width}×{photo.height}
          </div>
          <div>
            <span className="font-semibold">Size:</span> {(photo.data.length / 1024).toFixed(1)}KB
          </div>
        </div>
        
        <StickerProcessingStatus
          isProcessing={isProcessing}
          isComplete={isComplete}
          hasError={hasError}
          error={error}
          progress={progress}
          message={message}
          resultUrl={resultUrl}
        />
        
        <div className="modal-action">
          <button 
            className="btn btn-error gap-2"
            onClick={() => {
              onDelete(photo.id);
              onClose();
            }}
          >
            <Trash2 size={16} />
            Delete Photo
          </button>
          
          {!isProcessing ? (
            <button 
              className={`btn gap-2 ${
                photo.pbId || photo.hasRemote 
                  ? 'btn-primary' 
                  : 'btn-disabled'
              }`}
              onClick={() => onConvertToSticker(photo)}
              disabled={isProcessing || (!photo.pbId && !photo.hasRemote)}
              title={
                photo.pbId || photo.hasRemote
                  ? 'Create sticker from this photo'
                  : 'Photo must be synced to cloud first'
              }
            >
              <Check size={16} />
              {photo.pbId || photo.hasRemote ? 'Make Sticker' : 'Sync Required'}
            </button>
          ) : (
            <button className="btn btn-primary gap-2 loading" disabled>
              Processing...
            </button>
          )}
          
          {(isComplete || hasError) && (
            <button 
              className="btn btn-outline gap-2"
              onClick={onReset}
            >
              Reset
            </button>
          )}
          
          <button 
            className="btn btn-outline"
            onClick={() => {
              onClose();
              onReset();
            }}
          >
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default ExpandedPhotoModal;