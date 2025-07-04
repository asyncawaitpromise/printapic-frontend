import React, { useState, useRef } from 'react';
import { Upload, Image, AlertCircle, CheckCircle, X } from 'react-feather';
import { processMultipleFiles } from '../utils/mobileFileProcessor';

const MobileFileUpload = ({ onFilesUploaded, maxFiles = 10, className = '' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    // Check max files limit
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setPreviews([]);

    try {
      // Process files with progress tracking
      const processedFiles = await processMultipleFiles(files, (progress) => {
        setUploadProgress(progress);
      });

      if (processedFiles.length > 0) {
        // Create previews
        const previewData = processedFiles.map(file => ({
          id: file.id,
          data: file.data,
          name: file.metadata.originalName,
          size: file.metadata.fileSize
        }));
        
        setPreviews(previewData);
        
        // Call the callback with processed files
        if (onFilesUploaded) {
          onFilesUploaded(processedFiles);
        }
      } else {
        setError('No valid files were processed');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files);
    handleFileSelect(files);
    // Reset input
    event.target.value = '';
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const removePreview = (previewId) => {
    setPreviews(prev => prev.filter(p => p.id !== previewId));
  };

  const clearAll = () => {
    setPreviews([]);
    setError(null);
    setUploadProgress(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Button */}
      <div className="mb-4">
        <button
          onClick={openFileSelector}
          disabled={isUploading}
          className="btn btn-primary btn-lg w-full gap-3 h-16 text-lg"
        >
          <Upload size={24} />
          {isUploading ? 'Processing...' : 'Choose Photos'}
        </button>
        
        <div className="text-center mt-2 text-sm text-base-content/60">
          Maximum {maxFiles} photos • JPEG, PNG, WebP • Up to 10MB each
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="mb-4 p-4 bg-base-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Processing {uploadProgress.currentFile}
            </span>
            <span className="text-sm text-base-content/70">
              {uploadProgress.current} of {uploadProgress.total}
            </span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            ></div>
          </div>
          <div className="text-center mt-1 text-xs text-base-content/60">
            {uploadProgress.percentage}% complete
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-4">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="btn btn-ghost btn-sm"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Success Message */}
      {previews.length > 0 && !isUploading && (
        <div className="alert alert-success mb-4">
          <CheckCircle size={20} />
          <span>Successfully processed {previews.length} photo{previews.length !== 1 ? 's' : ''}</span>
          <button 
            onClick={clearAll}
            className="btn btn-ghost btn-sm"
          >
            Clear
          </button>
        </div>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Image size={20} />
            Preview ({previews.length})
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previews.map((preview) => (
              <div key={preview.id} className="relative group">
                <div className="aspect-square bg-base-200 rounded-lg overflow-hidden">
                  <img
                    src={preview.data}
                    alt={preview.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => removePreview(preview.id)}
                  className="absolute -top-2 -right-2 btn btn-circle btn-xs bg-error text-white border-none hover:bg-error/80"
                >
                  <X size={12} />
                </button>
                
                {/* File info */}
                <div className="mt-1 text-xs text-center">
                  <div className="truncate font-medium">{preview.name}</div>
                  <div className="text-base-content/60">{formatFileSize(preview.size)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-base-content/60 bg-base-200/50 p-3 rounded-lg">
        <div className="font-medium mb-1">📱 Tips for best results:</div>
        <ul className="space-y-1">
          <li>• Use good lighting for clearer photos</li>
          <li>• Hold camera steady to avoid blur</li>
          <li>• Higher resolution photos work better for stickers</li>
          <li>• Photos will be optimized automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileFileUpload; 