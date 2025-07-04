import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing mobile photo selection with touch optimizations
 * @param {Array} photos - Array of photo objects
 * @param {number} maxSelection - Maximum number of photos that can be selected
 * @returns {Object} - Selection state and methods
 */
export const useMobilePhotoSelection = (photos = [], maxSelection = 50) => {
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // Clear selection when photos change
  useEffect(() => {
    setSelectedPhotos(prev => {
      const photoIds = new Set(photos.map(p => p.id));
      const validSelections = new Set();
      
      prev.forEach(id => {
        if (photoIds.has(id)) {
          validSelections.add(id);
        }
      });
      
      return validSelections;
    });
  }, [photos]);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => {
      if (prev) {
        // Exiting selection mode - clear selections
        setSelectedPhotos(new Set());
        setLastSelectedIndex(null);
      }
      return !prev;
    });
  }, []);

  // Toggle single photo selection
  const togglePhotoSelection = useCallback((photoId) => {
    setSelectedPhotos(prev => {
      const newSelection = new Set(prev);
      
      if (newSelection.has(photoId)) {
        newSelection.delete(photoId);
      } else {
        // Check max selection limit
        if (newSelection.size >= maxSelection) {
          console.warn(`Maximum ${maxSelection} photos can be selected`);
          return prev;
        }
        newSelection.add(photoId);
      }
      
      return newSelection;
    });
  }, [maxSelection]);

  // Select photo with range support (for shift-click equivalent on mobile)
  const selectPhotoWithRange = useCallback((photoId, photoIndex) => {
    setSelectedPhotos(prev => {
      const newSelection = new Set(prev);
      
      // If we have a last selected index and it's different, select range
      if (lastSelectedIndex !== null && lastSelectedIndex !== photoIndex) {
        const startIndex = Math.min(lastSelectedIndex, photoIndex);
        const endIndex = Math.max(lastSelectedIndex, photoIndex);
        
        for (let i = startIndex; i <= endIndex; i++) {
          if (i < photos.length) {
            const photo = photos[i];
            if (photo && newSelection.size < maxSelection) {
              newSelection.add(photo.id);
            }
          }
        }
      } else {
        // Single selection
        if (newSelection.has(photoId)) {
          newSelection.delete(photoId);
        } else if (newSelection.size < maxSelection) {
          newSelection.add(photoId);
        }
      }
      
      return newSelection;
    });
    
    setLastSelectedIndex(photoIndex);
  }, [photos, lastSelectedIndex, maxSelection]);

  // Select all photos
  const selectAllPhotos = useCallback(() => {
    const photosToSelect = photos.slice(0, maxSelection);
    setSelectedPhotos(new Set(photosToSelect.map(p => p.id)));
  }, [photos, maxSelection]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedPhotos(new Set());
    setLastSelectedIndex(null);
  }, []);

  // Select photos by filter function
  const selectPhotosByFilter = useCallback((filterFn) => {
    const filteredPhotos = photos.filter(filterFn).slice(0, maxSelection);
    setSelectedPhotos(new Set(filteredPhotos.map(p => p.id)));
  }, [photos, maxSelection]);

  // Get selected photo objects
  const getSelectedPhotos = useCallback(() => {
    return photos.filter(photo => selectedPhotos.has(photo.id));
  }, [photos, selectedPhotos]);

  // Check if photo is selected
  const isPhotoSelected = useCallback((photoId) => {
    return selectedPhotos.has(photoId);
  }, [selectedPhotos]);

  // Get selection stats
  const getSelectionStats = useCallback(() => {
    const selectedCount = selectedPhotos.size;
    const totalCount = photos.length;
    const maxReached = selectedCount >= maxSelection;
    
    return {
      selectedCount,
      totalCount,
      maxReached,
      percentage: totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0
    };
  }, [selectedPhotos.size, photos.length, maxSelection]);

  // Haptic feedback for mobile devices
  const triggerHapticFeedback = useCallback((type = 'light') => {
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [50, 50, 50]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }, []);

  // Long press handler for mobile
  const handleLongPress = useCallback((photoId, photoIndex) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      triggerHapticFeedback('medium');
    }
    togglePhotoSelection(photoId);
    setLastSelectedIndex(photoIndex);
  }, [isSelectionMode, togglePhotoSelection, triggerHapticFeedback]);

  return {
    // State
    selectedPhotos,
    isSelectionMode,
    
    // Methods
    toggleSelectionMode,
    togglePhotoSelection,
    selectPhotoWithRange,
    selectAllPhotos,
    clearSelection,
    selectPhotosByFilter,
    
    // Getters
    getSelectedPhotos,
    isPhotoSelected,
    getSelectionStats,
    
    // Mobile-specific
    handleLongPress,
    triggerHapticFeedback
  };
}; 