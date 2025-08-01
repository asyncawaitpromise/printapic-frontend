import React from 'react';
import { useStickerProcessor } from '../hooks/useStickerProcessor.js';
import { getStatusClasses, getStatusBadge, formatProcessingTime } from '../utils/stickerHelpers.js';

/**
 * Sticker processing component with UI
 * @param {Object} props
 * @param {string} props.photoId - Photo ID to process
 * @param {Function} [props.onComplete] - Callback when sticker is complete
 * @param {Function} [props.onError] - Callback when error occurs
 */
const StickerProcessor = ({ photoId, onComplete, onError }) => {
  const {
    status,
    editId,
    resultUrl,
    error,
    progress,
    message,
    isProcessing,
    isComplete,
    hasError,
    createSticker,
    reset
  } = useStickerProcessor();

  const handleCreateSticker = async () => {
    try {
      const result = await createSticker(photoId);
      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      if (onError) {
        onError(err);
      }
    }
  };

  const statusBadge = getStatusBadge(status);
  const statusClasses = getStatusClasses(status);

  return (
    <div className="sticker-processor p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sticker Creator</h3>
        <div className={`badge badge-${statusBadge.variant}`}>
          {statusBadge.text}
        </div>
      </div>

      {/* Status Message */}
      <div className={`mb-4 ${statusClasses}`}>
        {message || 'Ready to create sticker'}
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-4">
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
        <div className="alert alert-error mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Result Image */}
      {isComplete && resultUrl && (
        <div className="mb-4">
          <img
            src={resultUrl}
            alt="Generated sticker"
            className="max-w-full h-auto rounded-lg border"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {status === 'idle' && (
          <button
            onClick={handleCreateSticker}
            className="btn btn-primary"
            disabled={!photoId}
          >
            Create Sticker
          </button>
        )}

        {isProcessing && (
          <button className="btn btn-primary loading" disabled>
            Processing...
          </button>
        )}

        {isComplete && resultUrl && (
          <>
            <a
              href={resultUrl}
              download="sticker.png"
              className="btn btn-success"
            >
              Download Sticker
            </a>
            <button
              onClick={reset}
              className="btn btn-outline"
            >
              Create Another
            </button>
          </>
        )}

        {hasError && (
          <>
            <button
              onClick={handleCreateSticker}
              className="btn btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={reset}
              className="btn btn-outline"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Debug Info */}
      {editId && (
        <div className="mt-4 text-xs text-gray-500">
          Edit ID: {editId}
        </div>
      )}
    </div>
  );
};

export default StickerProcessor;