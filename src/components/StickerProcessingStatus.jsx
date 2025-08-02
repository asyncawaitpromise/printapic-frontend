import React from 'react';
import { AlertCircle } from 'react-feather';

const StickerProcessingStatus = ({
  isProcessing,
  isComplete,
  hasError,
  error,
  progress,
  message,
  resultUrl
}) => {
  if (!isProcessing && !isComplete && !hasError) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-base-200 rounded-lg">
      <h4 className="font-semibold mb-2">Sticker Processing</h4>
      
      {/* Status Message */}
      <div className={`mb-2 ${
        hasError ? 'text-error' : 
        isComplete ? 'text-success' : 
        'text-info'
      }`}>
        {message}
      </div>
      
      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {hasError && (
        <div className="alert alert-error py-2">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {/* Result */}
      {isComplete && resultUrl && (
        <div className="space-y-2">
          <img
            src={resultUrl}
            alt="Generated sticker"
            className="max-w-full h-auto max-h-32 rounded-lg border mx-auto"
          />
          <a
            href={resultUrl}
            download="sticker.png"
            className="btn btn-success btn-sm w-full"
          >
            Download Sticker
          </a>
        </div>
      )}
    </div>
  );
};

export default StickerProcessingStatus;