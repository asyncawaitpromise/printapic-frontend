import { useState, useCallback } from 'react';
import stickerService from '../services/stickerService.js';

/**
 * Custom hook for managing sticker processing workflow
 * @returns {Object} - Sticker processing state and methods
 */
export const useStickerProcessor = () => {
  const [status, setStatus] = useState('idle');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  /**
   * Create a sticker from a photo
   * @param {string} pocketbaseRecordId - PocketBase record ID to process
   */
  const createSticker = useCallback(async (pocketbaseRecordId) => {
    try {
      setStatus('starting');
      setError(null);
      setProgress(0);
      setMessage('Starting sticker creation...');

      const newEditId = await stickerService.createSticker(pocketbaseRecordId);
      setEditId(newEditId);

      const result = await stickerService.pollUntilComplete(newEditId, (update) => {
        setStatus(update.status);
        setProgress(getProgress(update.status));
        setMessage(update.message || getStatusMessage(update.status));
      });

      setStatus('complete');
      setProgress(100);
      setMessage(result.message || 'Processing complete. Check your photos for the result.');

      return result;

    } catch (err) {
      setError(err.message);
      setStatus('error');
      setProgress(0);
      setMessage(err.message || 'Something went wrong');
      throw err;
    }
  }, []);

  /**
   * Reset the processing state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setEditId(null);
    setError(null);
    setProgress(0);
    setMessage('');
  }, []);

  /**
   * Check if sticker creation is in progress
   */
  const isProcessing = status === 'starting' || status === 'pending' || status === 'processing';

  /**
   * Check if sticker creation is complete
   */
  const isComplete = status === 'complete';

  /**
   * Check if sticker creation failed
   */
  const hasError = status === 'error';

  return {
    // State
    status,
    editId,
    error,
    progress,
    message,
    
    // Computed state
    isProcessing,
    isComplete,
    hasError,
    
    // Actions
    createSticker,
    reset
  };
};

/**
 * Get user-friendly status message
 * @param {string} status - Processing status
 * @returns {string} - User-friendly message
 */
function getStatusMessage(status) {
  const messages = {
    'pending': 'Waiting in queue...',
    'processing': 'Creating your sticker...',
    'done': 'Sticker complete!',
    'failed': 'Processing failed'
  };
  return messages[status] || 'Unknown status';
}

/**
 * Get progress percentage for status
 * @param {string} status - Processing status
 * @returns {number} - Progress percentage (0-100)
 */
function getProgress(status) {
  const progress = {
    'pending': 25,
    'processing': 75,
    'done': 100,
    'failed': 0
  };
  return progress[status] || 0;
}

export default useStickerProcessor;