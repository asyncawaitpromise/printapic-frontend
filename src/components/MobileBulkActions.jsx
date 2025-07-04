import React, { useState } from 'react';
import { Trash2, Share, Download, Zap, X, Check, AlertTriangle } from 'react-feather';

const MobileBulkActions = ({ 
  selectedPhotos = [], 
  onDeleteSelected, 
  onShareSelected, 
  onDownloadSelected,
  onConvertToStickers,
  onClearSelection,
  className = '' 
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCount = selectedPhotos.length;

  const handleDelete = async () => {
    if (selectedCount === 0) return;
    
    setIsProcessing(true);
    try {
      await onDeleteSelected?.(selectedPhotos);
      setShowConfirmDelete(false);
      
      // Haptic feedback for success
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Error deleting photos:', error);
      // Haptic feedback for error
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (selectedCount === 0) return;
    
    setIsProcessing(true);
    try {
      await onShareSelected?.(selectedPhotos);
      
      // Haptic feedback for success
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Error sharing photos:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (selectedCount === 0) return;
    
    setIsProcessing(true);
    try {
      await onDownloadSelected?.(selectedPhotos);
      
      // Haptic feedback for success
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Error downloading photos:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvertToStickers = async () => {
    if (selectedCount === 0) return;
    
    setIsProcessing(true);
    try {
      await onConvertToStickers?.(selectedPhotos);
      
      // Haptic feedback for success
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Error converting to stickers:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      {/* Bottom Sheet Actions */}
      <div className={`fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-4 pb-safe z-40 ${className}`}>
        {/* Selection Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
            <span className="font-semibold text-lg">
              {selectedCount} Selected
            </span>
          </div>
          
          <button
            onClick={onClearSelection}
            className="btn btn-ghost btn-sm gap-1"
            disabled={isProcessing}
          >
            <X size={16} />
            Clear
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Convert to Stickers */}
          <button
            onClick={handleConvertToStickers}
            disabled={isProcessing}
            className="btn btn-primary btn-lg gap-2 h-14"
          >
                          <Zap size={20} />
            <div className="text-left">
              <div className="font-semibold">Make Stickers</div>
              <div className="text-xs opacity-70">AI Processing</div>
            </div>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            disabled={isProcessing}
            className="btn btn-outline btn-lg gap-2 h-14"
          >
            <Share size={20} />
            <div className="text-left">
              <div className="font-semibold">Share</div>
              <div className="text-xs opacity-70">Export Photos</div>
            </div>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="btn btn-outline btn-lg gap-2 h-14"
          >
            <Download size={20} />
            <div className="text-left">
              <div className="font-semibold">Download</div>
              <div className="text-xs opacity-70">Save to Device</div>
            </div>
          </button>

          {/* Delete */}
          <button
            onClick={() => setShowConfirmDelete(true)}
            disabled={isProcessing}
            className="btn btn-outline btn-error btn-lg gap-2 h-14"
          >
            <Trash2 size={20} />
            <div className="text-left">
              <div className="font-semibold">Delete</div>
              <div className="text-xs opacity-70">Remove Photos</div>
            </div>
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="loading loading-spinner loading-md"></div>
            <p className="text-sm text-base-content/70 mt-2">Processing...</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-base-100 rounded-lg p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-error" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Delete Photos?</h3>
              <p className="text-base-content/70 mb-6">
                Are you sure you want to delete {selectedCount} photo{selectedCount !== 1 ? 's' : ''}? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="btn btn-outline flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-error flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBulkActions; 