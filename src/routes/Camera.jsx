import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, Image, Trash2, Check, ArrowLeft, RotateCcw } from 'react-feather';
import { useNavigate } from 'react-router-dom';

const Camera = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [currentView, setCurrentView] = useState('camera'); // 'camera' or 'gallery'
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back

  // Load photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('captured-photos');
    if (savedPhotos) {
      try {
        setPhotos(JSON.parse(savedPhotos));
      } catch (e) {
        console.error('Error loading photos from localStorage:', e);
      }
    }
  }, []);

  // Save photos to localStorage whenever photos state changes
  useEffect(() => {
    localStorage.setItem('captured-photos', JSON.stringify(photos));
  }, [photos]);

  // Start camera stream
  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  // Switch between front and back camera
  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Restart camera with new facing mode
  useEffect(() => {
    if (isStreaming) {
      startCamera();
    }
  }, [facingMode]);

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Create photo object with metadata
    const newPhoto = {
      id: Date.now().toString(),
      data: imageData,
      timestamp: new Date().toISOString(),
      width: canvas.width,
      height: canvas.height
    };

    // Add to photos array
    setPhotos(prev => [newPhoto, ...prev]);
  };

  // Delete photo
  const deletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  // Convert to sticker (placeholder)
  const convertToSticker = (photoId) => {
    // Placeholder function for future sticker conversion
    alert(`Converting photo ${photoId} to sticker - This feature will be implemented later!`);
  };

  // Clean up stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <button 
            className="btn btn-ghost gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
        <div className="navbar-center">
          <span className="text-xl font-bold">Photo Studio</span>
        </div>
        <div className="navbar-end">
          <div className="btn-group">
            <button 
              className={`btn ${currentView === 'camera' ? 'btn-active' : ''}`}
              onClick={() => setCurrentView('camera')}
            >
              <CameraIcon size={16} />
              Camera
            </button>
            <button 
              className={`btn ${currentView === 'gallery' ? 'btn-active' : ''}`}
              onClick={() => setCurrentView('gallery')}
            >
              <Image size={16} />
              Gallery ({photos.length})
            </button>
          </div>
        </div>
      </div>

      {currentView === 'camera' && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Take a Photo</h2>
                
                {error && (
                  <div className="alert alert-error mb-4">
                    <span>{error}</span>
                  </div>
                )}

                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {isStreaming ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <CameraIcon size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Camera not active</p>
                        <p className="text-sm opacity-70">Click "Start Camera" to begin</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Camera controls overlay */}
                  {isStreaming && (
                    <div className="absolute top-4 right-4">
                      <button
                        className="btn btn-circle btn-sm bg-black/50 text-white border-white/30 hover:bg-black/70"
                        onClick={switchCamera}
                        title="Switch Camera"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />

                <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                  {!isStreaming ? (
                    <button 
                      className="btn btn-primary btn-lg gap-2"
                      onClick={startCamera}
                    >
                      <CameraIcon size={20} />
                      Start Camera
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn btn-success btn-lg gap-2"
                        onClick={capturePhoto}
                      >
                        <CameraIcon size={20} />
                        Capture Photo
                      </button>
                      <button 
                        className="btn btn-outline btn-lg"
                        onClick={stopCamera}
                      >
                        Stop Camera
                      </button>
                    </>
                  )}
                </div>

                {photos.length > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-base-content/70">
                      You have {photos.length} photo{photos.length !== 1 ? 's' : ''} saved.{' '}
                      <button 
                        className="link link-primary"
                        onClick={() => setCurrentView('gallery')}
                      >
                        View Gallery
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'gallery' && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Photo Gallery</h2>
              <p className="text-base-content/70">
                {photos.length === 0 
                  ? 'No photos captured yet. Go to the camera to take your first photo!'
                  : `${photos.length} photo${photos.length !== 1 ? 's' : ''} ready for customization.`
                }
              </p>
            </div>

            {photos.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <Image size={64} className="mx-auto mb-4 text-base-content/30" />
                  <h3 className="text-xl font-semibold mb-2">No Photos Yet</h3>
                  <p className="text-base-content/70 mb-6">
                    Take your first photo to get started with creating amazing stickers!
                  </p>
                  <button 
                    className="btn btn-primary gap-2"
                    onClick={() => setCurrentView('camera')}
                  >
                    <CameraIcon size={20} />
                    Take a Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="card bg-base-100 shadow-xl">
                    <figure className="aspect-video">
                      <img 
                        src={photo.data} 
                        alt={`Captured ${new Date(photo.timestamp).toLocaleDateString()}`}
                        className="w-full h-full object-cover"
                      />
                    </figure>
                    <div className="card-body">
                      <div className="text-sm text-base-content/70 mb-3">
                        Captured {new Date(photo.timestamp).toLocaleString()}
                      </div>
                      <div className="card-actions justify-between">
                        <button 
                          className="btn btn-error btn-sm gap-1"
                          onClick={() => deletePhoto(photo.id)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                        <button 
                          className="btn btn-primary btn-sm gap-1"
                          onClick={() => convertToSticker(photo.id)}
                        >
                          <Check size={14} />
                          Make Sticker
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;