/**
 * Utility functions for sticker processing UI
 */

/**
 * Get user-friendly status message for sticker processing
 * @param {string} status - Processing status
 * @returns {string} - User-friendly message
 */
export function getStatusMessage(status) {
  const messages = {
    'idle': 'Ready to create sticker',
    'starting': 'Starting sticker creation...',
    'pending': 'Waiting in queue...',
    'processing': 'Creating your sticker...',
    'done': 'Sticker complete!',
    'complete': 'Sticker ready!',
    'failed': 'Processing failed',
    'error': 'Something went wrong'
  };
  return messages[status] || 'Unknown status';
}

/**
 * Get progress percentage for processing status
 * @param {string} status - Processing status
 * @returns {number} - Progress percentage (0-100)
 */
export function getProgress(status) {
  const progress = {
    'idle': 0,
    'starting': 10,
    'pending': 25,
    'processing': 75,
    'done': 100,
    'complete': 100,
    'failed': 0,
    'error': 0
  };
  return progress[status] || 0;
}

/**
 * Update UI elements with sticker processing status
 * @param {Object} params - Update parameters
 * @param {string} params.status - Processing status
 * @param {string} params.message - Status message
 * @param {string} [params.imageUrl] - Result image URL
 * @param {number} [params.progress] - Progress percentage
 * @param {string} [params.editId] - Edit ID
 */
export function updateUI({ status, message, imageUrl, progress, editId }) {
  // Update status message
  const statusElement = document.getElementById('sticker-status');
  if (statusElement) {
    statusElement.textContent = message;
  }

  // Update progress bar
  if (progress !== undefined) {
    const progressElement = document.getElementById('sticker-progress');
    if (progressElement) {
      progressElement.style.width = `${progress}%`;
    }
    
    const progressTextElement = document.getElementById('sticker-progress-text');
    if (progressTextElement) {
      progressTextElement.textContent = `${progress}%`;
    }
  }

  // Update result image
  if (imageUrl) {
    const resultImageElement = document.getElementById('sticker-result-image');
    if (resultImageElement) {
      resultImageElement.src = imageUrl;
      resultImageElement.style.display = 'block';
    }

    const downloadButtonElement = document.getElementById('sticker-download-btn');
    if (downloadButtonElement) {
      downloadButtonElement.href = imageUrl;
      downloadButtonElement.style.display = 'inline-block';
    }
  }

  // Update status classes for styling
  const containerElement = document.getElementById('sticker-container');
  if (containerElement) {
    containerElement.className = containerElement.className.replace(/sticker-status-\w+/g, '');
    containerElement.classList.add(`sticker-status-${status}`);
  }
}

/**
 * Get status-based CSS classes for styling
 * @param {string} status - Processing status
 * @returns {string} - CSS classes
 */
export function getStatusClasses(status) {
  const classes = {
    'idle': 'text-gray-600',
    'starting': 'text-blue-600 animate-pulse',
    'pending': 'text-yellow-600 animate-pulse',
    'processing': 'text-blue-600 animate-pulse',
    'done': 'text-green-600',
    'complete': 'text-green-600',
    'failed': 'text-red-600',
    'error': 'text-red-600'
  };
  return classes[status] || 'text-gray-600';
}

/**
 * Get status-based badge configuration
 * @param {string} status - Processing status
 * @returns {Object} - Badge configuration
 */
export function getStatusBadge(status) {
  const badges = {
    'idle': { text: 'Ready', variant: 'secondary' },
    'starting': { text: 'Starting', variant: 'info' },
    'pending': { text: 'Queued', variant: 'warning' },
    'processing': { text: 'Processing', variant: 'info' },
    'done': { text: 'Complete', variant: 'success' },
    'complete': { text: 'Ready', variant: 'success' },
    'failed': { text: 'Failed', variant: 'error' },
    'error': { text: 'Error', variant: 'error' }
  };
  return badges[status] || { text: 'Unknown', variant: 'secondary' };
}

/**
 * Format processing time
 * @param {string} startTime - ISO timestamp when processing started
 * @param {string} [endTime] - ISO timestamp when processing ended
 * @returns {string} - Formatted time duration
 */
export function formatProcessingTime(startTime, endTime = null) {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const duration = Math.round((end - start) / 1000);

  if (duration < 60) {
    return `${duration}s`;
  } else if (duration < 3600) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}