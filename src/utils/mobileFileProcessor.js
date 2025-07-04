// Mobile File Processing Utilities
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
const MAX_DIMENSION = 4096;

/**
 * Validate uploaded file
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  // Check file format
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Unsupported file format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Resize image for mobile storage optimization
 * @param {File} file - The image file to resize
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<string>} - Base64 string of resized image
 */
export const resizeImageForMobile = (file, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(base64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Extract metadata from file
 * @param {File} file - The file to extract metadata from
 * @returns {Promise<Object>} - Metadata object
 */
export const extractMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const metadata = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        fileSize: file.size,
        originalName: file.name,
        mimeType: file.type,
        lastModified: file.lastModified
      };
      
      URL.revokeObjectURL(img.src);
      resolve(metadata);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to extract metadata'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert file to base64
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string
 */
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to convert file to base64'));
    
    reader.readAsDataURL(file);
  });
};

/**
 * Handle mobile camera orientation issues
 * @param {File} file - The image file
 * @returns {Promise<string>} - Base64 string with corrected orientation
 */
export const handleImageOrientation = (file) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // For now, we'll just return the image as-is
      // In a real implementation, you'd read EXIF data and rotate accordingly
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      
      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      resolve(base64);
    };

    img.onerror = () => reject(new Error('Failed to handle image orientation'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Process multiple files for mobile upload
 * @param {FileList} files - Files to process
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of processed photo objects
 */
export const processMultipleFiles = async (files, onProgress = () => {}) => {
  const processedFiles = [];
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    
    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        console.warn(`Skipping invalid file ${file.name}: ${validation.error}`);
        continue;
      }

      // Extract metadata
      const metadata = await extractMetadata(file);
      
      // Resize and convert to base64
      const base64Data = await resizeImageForMobile(file, 1920, 1080);
      
      // Create photo object
      const photoObject = {
        id: Date.now().toString() + '_' + i,
        data: base64Data,
        source: 'upload',
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          processed: true
        }
      };

      processedFiles.push(photoObject);
      
      // Report progress
      onProgress({
        current: i + 1,
        total: totalFiles,
        percentage: Math.round(((i + 1) / totalFiles) * 100),
        currentFile: file.name
      });

    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }

  return processedFiles;
}; 