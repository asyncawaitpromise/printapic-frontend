import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Zap, Eye, MoreVertical, Check } from 'react-feather';

const MobilePhotoCard = ({ 
  photo, 
  index,
  isSelected = false,
  isSelectionMode = false,
  onToggleSelection,
  onLongPress,
  onView,
  onMakeSticker,
  className = '' 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const longPressTimer = useRef(null);
  const pressStartTime = useRef(null);

  // Track touch start position to detect scroll/dragging
  const touchStartPos = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  // Long press detection
  const handleTouchStart = (e) => {
    setIsPressed(true);
    pressStartTime.current = Date.now();
    
    // Record the initial touch position
    const touch = e.touches ? e.touches[0] : e;
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    movedRef.current = false;
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress(photo.id, index);
        // Haptic feedback for long press
        if (navigator.vibrate) {
          navigator.vibrate([20]);
        }
      }
    }, 500); // 500ms for long press
  };

  // Cancel long-press if user drags (scrolls) more than a small threshold
  const handleTouchMove = (e) => {
    if (!longPressTimer.current) return; // already cancelled or triggered

    const touch = e.touches ? e.touches[0] : e;
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    const MOVE_THRESHOLD = 10; // pixels
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      // User is likely scrolling – cancel long press
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      movedRef.current = true;
      setIsPressed(false);
    }
  };

  const handleTouchEnd = (e) => {
    setIsPressed(false);
    
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // If the user moved (scrolling), do nothing further.
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }

    // If it was a quick tap and we're in selection mode, toggle selection
    const pressDuration = Date.now() - (pressStartTime.current || 0);
    if (pressDuration < 500 && isSelectionMode && onToggleSelection) {
      onToggleSelection(photo.id);
      // Haptic feedback for selection
      if (navigator.vibrate) {
        navigator.vibrate([10]);
      }

      // Prevent the following click event (generated after touchend) from firing,
      // which would otherwise toggle the selection a second time.
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
    }
  };

  // Handle regular click / tap (after the touch sequence has ended)
  const handleClick = () => {
    if (isSelectionMode) {
      // In selection mode, a regular click should toggle selection
      onToggleSelection?.(photo.id);

      // Optional haptic feedback for quick feedback
      if (navigator.vibrate) {
        navigator.vibrate([10]);
      }
    } else {
      // Normal behaviour: open photo preview
      onView?.(photo);
    }
  };

  const handleQuickAction = (action, e) => {
    e.stopPropagation();
    setShowQuickActions(false);
    
    switch (action) {
      case 'view':
        onView?.(photo);
        break;
      case 'sticker':
        onMakeSticker?.(photo);
        break;
      default:
        break;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSourceIcon = () => {
    switch (photo.source) {
      case 'camera':
        return <Camera size={12} />;
      case 'upload':
        return <Upload size={12} />;
      default:
        return <Camera size={12} />;
    }
  };

  const getProcessingStatus = () => {
    if (photo.processing?.status === 'processing') {
      return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <div className="loading loading-spinner loading-md mb-2"></div>
            <div className="text-xs">Processing...</div>
          </div>
        </div>
      );
    }
    
    if (photo.processing?.status === 'completed') {
      return (
        <div className="absolute top-2 right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      );
    }
    
    return null;
  };

  // Explicitly suppress the browser context menu (e.g., on long-press)
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          relative aspect-square bg-base-200 rounded-lg overflow-hidden cursor-pointer
          transition-transform duration-150 select-none
          ${isPressed ? 'scale-95' : 'scale-100'}
          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        `}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {/* Photo Image */}
        <img
          src={photo.data}
          alt={`Photo ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div className="absolute top-2 left-2 z-10">
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-colors duration-200
              ${isSelected 
                ? 'bg-primary border-primary' 
                : 'bg-white/80 border-white/80 backdrop-blur-sm'
              }
            `}>
              {isSelected && <Check size={14} className="text-white" />}
            </div>
          </div>
        )}

        {/* Source Badge */}
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          {getSourceIcon()}
          <span className="capitalize">{photo.source}</span>
        </div>

        {/* Processing Status */}
        {getProcessingStatus()}

        {/* Quick Actions Menu */}
        {!isSelectionMode && (
          <div className="absolute bottom-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickActions(!showQuickActions);
              }}
              className="btn btn-circle btn-xs bg-black/60 text-white border-none hover:bg-black/80"
            >
              <MoreVertical size={12} />
            </button>
          </div>
        )}

        {/* Quick Actions Dropdown */}
        {showQuickActions && (
          <div className="absolute bottom-8 right-2 bg-base-100 rounded-lg shadow-lg border border-base-300 p-2 z-20">
            <button
              onClick={(e) => handleQuickAction('view', e)}
              className="btn btn-ghost btn-sm w-full justify-start gap-2"
            >
              <Eye size={14} />
              View
            </button>
            <button
              onClick={(e) => handleQuickAction('sticker', e)}
              className="btn btn-ghost btn-sm w-full justify-start gap-2"
            >
                                <Zap size={14} />
              Make Sticker
            </button>
          </div>
        )}
      </div>

      {/* Photo Info */}
      <div className="mt-2 text-xs text-center">
        <div className="text-base-content/70 truncate">
          {formatTimestamp(photo.timestamp)}
        </div>
        {photo.metadata && (
          <div className="text-base-content/50">
            {photo.metadata.width}×{photo.metadata.height}
          </div>
        )}
      </div>

      {/* Click outside to close quick actions */}
      {showQuickActions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowQuickActions(false)}
        />
      )}
    </div>
  );
};

export default MobilePhotoCard; 