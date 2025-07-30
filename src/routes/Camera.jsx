import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, Image, ArrowLeft, RotateCcw, Maximize, Minimize, X, Upload, Cloud, CloudOff, Check, AlertCircle } from 'react-feather';
import { useNavigate, Link } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import MobileFileUpload from '../components/MobileFileUpload';
import { photoService } from '../services/photoService';
import { authService } from '../services/authService';

const Camera = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [debugInfo, setDebugInfo] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastCapturedPhoto, setLastCapturedPhoto] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' or 'upload'
  const containerRef = useRef(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'
  const [syncMessage, setSyncMessage] = useState('');

  // Load photos from localStorage on component mount
  useEffect(() => {
    console.log('🎬 Camera component mounted');
    console.log('🔍 Browser support check:');
    console.log('🔍 navigator.mediaDevices:', !!navigator.mediaDevices);
    console.log('🔍 getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
    console.log('🔍 User agent:', navigator.userAgent);
    console.log('🔍 Protocol:', window.location.protocol);
    
    const savedPhotos = localStorage.getItem('captured-photos');
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(savedPhotos);
        console.log('📸 Loaded photos from localStorage:', parsedPhotos.length, 'photos');
        setPhotos(parsedPhotos);
      } catch (e) {
        console.error('📸 Error loading photos from localStorage:', e);
      }
    } else {
      console.log('📸 No saved photos found in localStorage');
    }
  }, []);

  // Save photos to localStorage whenever photos state changes
  useEffect(() => {
    localStorage.setItem('captured-photos', JSON.stringify(photos));
  }, [photos]);

  // Start camera stream
  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      setError('');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }
      
      console.log('🎥 Requesting camera with facingMode:', facingMode);
      
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log('🎥 Camera constraints:', constraints);
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('🎥 Got media stream with constraints:', stream);
      } catch (constraintError) {
        console.log('🎥 Failed with facingMode constraint, trying without it:', constraintError.name);
        // Try without facingMode constraint as fallback
        const fallbackConstraints = {
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        console.log('🎥 Got media stream with fallback constraints:', stream);
      }
      console.log('🎥 Video tracks:', stream.getVideoTracks());
      
      if (videoRef.current) {
        console.log('🎥 Setting stream to video element');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Add event listeners to video element for debugging
        videoRef.current.onloadedmetadata = () => {
          console.log('🎥 Video metadata loaded');
          console.log('🎥 Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
        };
        
        videoRef.current.oncanplay = () => {
          console.log('🎥 Video can start playing');
        };
        
        videoRef.current.onplay = () => {
          console.log('🎥 Video started playing');
        };
        
        videoRef.current.onerror = (e) => {
          console.error('🎥 Video element error:', e);
        };
        
        // Try to play the video
        try {
          await videoRef.current.play();
          console.log('🎥 Video play() succeeded');
        } catch (playError) {
          console.log('🎥 Video play() failed, but this might be OK:', playError);
        }
        
        setIsStreaming(true);
        console.log('🎥 Camera started successfully');
      } else {
        console.error('🎥 Video ref is null');
        throw new Error('Video element not found');
      }
    } catch (err) {
      console.error('🎥 Error accessing camera:', err);
      console.error('🎥 Error name:', err.name);
      console.error('🎥 Error message:', err.message);
      
      let errorMessage = 'Unable to access camera. ';
      
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          errorMessage += 'Please grant camera permissions and refresh the page.';
          break;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          errorMessage += 'No camera found on this device.';
          break;
        case 'NotReadableError':
        case 'TrackStartError':
          errorMessage += 'Camera is already in use by another application.';
          break;
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          errorMessage += 'Camera does not support the requested settings.';
          break;
        case 'NotSupportedError':
          errorMessage += 'Camera is not supported in this browser.';
          break;
        case 'TypeError':
          errorMessage += 'Camera access is not supported in this browser.';
          break;
        default:
          errorMessage += `Error: ${err.message}`;
      }
      
      setError(errorMessage);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
    if (streamRef.current) {
      console.log('🛑 Stopping tracks:', streamRef.current.getTracks());
      streamRef.current.getTracks().forEach(track => {
        console.log('🛑 Stopping track:', track);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    console.log('🛑 Camera stopped');
  };

  // Switch between front and back camera
  const switchCamera = () => {
    console.log('🔄 Switching camera from', facingMode, 'to', facingMode === 'user' ? 'environment' : 'user');
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Restart camera with new facing mode
  useEffect(() => {
    if (isStreaming) {
      console.log('🔄 Restarting camera with new facing mode:', facingMode);
      startCamera();
    }
  }, [facingMode]);

  // Capture photo
  const capturePhoto = async () => {
    console.log('📸 Capturing photo...');
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('📸 Video or canvas ref is null');
      console.log('📸 videoRef.current:', videoRef.current);
      console.log('📸 canvasRef.current:', canvasRef.current);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    console.log('📸 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    console.log('📸 Video ready state:', video.readyState);

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    console.log('📸 Canvas dimensions set to:', canvas.width, 'x', canvas.height);

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('📸 Image data length:', imageData.length);
    
    // Create photo object with metadata
    const newPhoto = {
      id: Date.now().toString(),
      data: imageData,
      timestamp: new Date().toISOString(),
      width: canvas.width,
      height: canvas.height,
      syncStatus: 'local_only'
    };

    console.log('📸 New photo created:', newPhoto.id, newPhoto.width + 'x' + newPhoto.height);

    // Add to photos array
    setPhotos(prev => {
      const updated = [newPhoto, ...prev];
      console.log('📸 Photos array updated, total count:', updated.length);
      return updated;
    });

    // Set as last captured photo for preview
    setLastCapturedPhoto(newPhoto);
    
    // Show flash effect
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
    }, 200);
    
    // Auto-hide the preview after 5 seconds
    setTimeout(() => {
      setLastCapturedPhoto(null);
    }, 5000);

    // Sync with PocketBase if user is authenticated
    if (authService.isAuthenticated) {
      syncPhotoToPocketBase(newPhoto);
    }
  };

  // Handle uploaded files
  const handleFilesUploaded = (uploadedFiles) => {
    console.log('📤 Files uploaded:', uploadedFiles.length, 'files');
    
    // Mark uploaded files as local_only initially
    const markedFiles = uploadedFiles.map(file => ({
      ...file,
      syncStatus: 'local_only'
    }));
    
    // Add uploaded files to photos array
    setPhotos(prev => {
      const updated = [...markedFiles, ...prev];
      console.log('📸 Photos array updated with uploads, total count:', updated.length);
      return updated;
    });

    // Sync with PocketBase if user is authenticated
    if (authService.isAuthenticated) {
      markedFiles.forEach(photo => {
        syncPhotoToPocketBase(photo);
      });
    }
  };

  // Sync individual photo to PocketBase
  const syncPhotoToPocketBase = async (photo) => {
    try {
      setSyncStatus('syncing');
      setSyncMessage('Syncing photo to cloud...');
      
      const result = await photoService.uploadPhoto(photo);
      
      if (result.success) {
        // Update the photo in the local array with sync info
        setPhotos(prev => prev.map(p => 
          p.id === photo.id 
            ? { ...p, pbId: result.photo.pbId, syncStatus: 'synced' }
            : p
        ));
        
        setSyncStatus('success');
        setSyncMessage('Photo synced successfully!');
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setSyncStatus('idle');
          setSyncMessage('');
        }, 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to sync photo:', error);
      setSyncStatus('error');
      setSyncMessage(`Sync failed: ${error.message}`);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 5000);
    }
  };

  // Sync all local photos to PocketBase
  const syncAllPhotos = async () => {
    if (!authService.isAuthenticated) {
      setSyncMessage('Please sign in to sync photos');
      return;
    }

    const localOnlyPhotos = photos.filter(p => p.syncStatus === 'local_only');
    
    if (localOnlyPhotos.length === 0) {
      setSyncMessage('All photos are already synced!');
      setTimeout(() => setSyncMessage(''), 3000);
      return;
    }

    try {
      setSyncStatus('syncing');
      setSyncMessage(`Syncing ${localOnlyPhotos.length} photos...`);
      
      const result = await photoService.syncLocalPhotos(localOnlyPhotos);
      
      if (result.success) {
        // Update local photos with sync results
        setPhotos(prev => prev.map(localPhoto => {
          const syncResult = result.syncResults.find(r => r.localId === localPhoto.id);
          if (syncResult && syncResult.status === 'synced') {
            return {
              ...localPhoto,
              pbId: syncResult.pbId,
              syncStatus: 'synced'
            };
          }
          return localPhoto;
        }));
        
        setSyncStatus('success');
        setSyncMessage(`Synced ${result.summary.successful} photos successfully!`);
        
        if (result.summary.failed > 0) {
          setTimeout(() => {
            setSyncMessage(`${result.summary.failed} photos failed to sync`);
          }, 3000);
        }
      } else {
        throw new Error('Sync operation failed');
      }
    } catch (error) {
      console.error('Failed to sync photos:', error);
      setSyncStatus('error');
      setSyncMessage(`Sync failed: ${error.message}`);
    }
    
    // Clear status after 5 seconds
    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 5000);
  };



  // Test camera availability
  const testCamera = async () => {
    console.log('🧪 Testing camera availability...');
    setDebugInfo('Testing camera...');
    
    try {
      // Check basic support
      if (!navigator.mediaDevices) {
        throw new Error('navigator.mediaDevices not available');
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not available');
      }
      
      // Check available devices
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('🧪 Available video devices:', videoDevices);
        setDebugInfo(`Found ${videoDevices.length} video devices`);
      }
      
      // Test basic getUserMedia without constraints
      console.log('🧪 Testing basic getUserMedia...');
      const testStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      console.log('🧪 Basic getUserMedia works!', testStream);
      
      // Clean up test stream
      testStream.getTracks().forEach(track => track.stop());
      
      setDebugInfo('Camera test successful!');
      
    } catch (error) {
      console.error('🧪 Camera test failed:', error);
      setDebugInfo(`Camera test failed: ${error.message}`);
         }
   };

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        console.log('📱 Entering fullscreen...');
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.mozRequestFullScreen) {
          await containerRef.current.mozRequestFullScreen();
        } else if (containerRef.current.msRequestFullscreen) {
          await containerRef.current.msRequestFullscreen();
        }
      } else {
        console.log('📱 Exiting fullscreen...');
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('📱 Fullscreen error:', error);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      console.log('📱 Fullscreen state changed:', isCurrentlyFullscreen);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Clean up stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-base-100 pb-20">

      {/* Camera Interface */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Mode Toggle */}
            <div className="tabs tabs-boxed mb-6 bg-base-200">
              <button 
                className={`tab tab-lg flex-1 gap-2 ${activeMode === 'camera' ? 'tab-active' : ''}`}
                onClick={() => setActiveMode('camera')}
              >
                <CameraIcon size={20} />
                Take Photo
              </button>
              <button 
                className={`tab tab-lg flex-1 gap-2 ${activeMode === 'upload' ? 'tab-active' : ''}`}
                onClick={() => setActiveMode('upload')}
              >
                <Upload size={20} />
                Upload Photos
              </button>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">
                  {activeMode === 'camera' ? 'Take a Photo' : 'Upload Photos'}
                </h2>
                
                {error && (
                  <div className="alert alert-error mb-4">
                    <span>{error}</span>
                  </div>
                )}

                {debugInfo && (
                  <div className="alert alert-info mb-4">
                    <span>{debugInfo}</span>
                  </div>
                )}

                {/* Camera Mode */}
                {activeMode === 'camera' && (
                  <>

                <div 
                  ref={containerRef}
                  className={`relative bg-black rounded-lg overflow-hidden ${
                    isFullscreen 
                      ? 'fixed inset-0 z-50 rounded-none' 
                      : 'aspect-[4/3] sm:aspect-video max-h-[70vh] sm:max-h-none'
                  }`}
                >
                  {/* Always render video element, but control visibility */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
                    onLoadedData={() => console.log('🎥 Video onLoadedData fired')}
                    onLoadStart={() => console.log('🎥 Video onLoadStart fired')}
                    onCanPlay={() => console.log('🎥 Video onCanPlay fired')}
                    onPlaying={() => console.log('🎥 Video onPlaying fired')}
                  />
                  
                  {/* Show placeholder when not streaming */}
                  {!isStreaming && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <CameraIcon size={48} className="sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-base sm:text-lg">Camera not active</p>
                        <p className="text-xs sm:text-sm opacity-70">Click "Start Camera" to begin</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Camera controls overlay - moved to bottom */}
                  {isStreaming && !isFullscreen && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                      <button
                        className="btn btn-circle btn-sm bg-black/50 text-white border-white/30 hover:bg-black/70"
                        onClick={toggleFullscreen}
                        title="Enter Fullscreen"
                      >
                        <Maximize size={20} />
                      </button>
                      <button
                        className="btn btn-circle btn-sm bg-black/50 text-white border-white/30 hover:bg-black/70"
                        onClick={switchCamera}
                        title="Switch Camera"
                      >
                        <RotateCcw size={20} />
                      </button>
                      {/* Debug button */}
                      <button
                        className="btn btn-circle btn-sm bg-black/50 text-white border-white/30 hover:bg-black/70"
                        onClick={() => {
                          console.log('🔍 DEBUG INFO:');
                          console.log('🔍 Video element:', videoRef.current);
                          console.log('🔍 Video srcObject:', videoRef.current?.srcObject);
                          console.log('🔍 Video readyState:', videoRef.current?.readyState);
                          console.log('🔍 Video paused:', videoRef.current?.paused);
                          console.log('🔍 Video videoWidth:', videoRef.current?.videoWidth);
                          console.log('🔍 Video videoHeight:', videoRef.current?.videoHeight);
                          console.log('🔍 Stream ref:', streamRef.current);
                          console.log('🔍 Stream active:', streamRef.current?.active);
                          console.log('🔍 Stream tracks:', streamRef.current?.getTracks());
                        }}
                        title="Debug Info"
                      >
                        <span className="text-sm">?</span>
                      </button>
                    </div>
                  )}

                  {/* Fullscreen controls */}
                  {isFullscreen && isStreaming && (
                    <>
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                        <button 
                          className="btn btn-circle btn-lg bg-white/20 text-white border-white/30 hover:bg-white/30"
                          onClick={capturePhoto}
                        >
                          <CameraIcon size={32} />
                        </button>
                      </div>
                      
                      {/* Exit fullscreen button */}
                      <div className="absolute top-4 right-4">
                        <button
                          className="btn btn-circle btn-sm bg-black/50 text-white border-white/30 hover:bg-black/70"
                          onClick={toggleFullscreen}
                          title="Exit Fullscreen"
                        >
                          <Minimize size={20} />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Last captured photo preview */}
                  {lastCapturedPhoto && isStreaming && (
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src={lastCapturedPhoto.data} 
                        alt="Last captured" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 btn btn-circle btn-xs bg-red-500 text-white border-none hover:bg-red-600"
                        onClick={() => setLastCapturedPhoto(null)}
                        title="Close preview"
                      >
                        <X size={10} className="sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  )}

                  {/* Camera flash effect */}
                  {showFlash && (
                    <div className="absolute inset-0 bg-white opacity-70 pointer-events-none animate-ping" 
                         style={{animationDuration: '200ms', animationIterationCount: 1}}></div>
                  )}
                </div>

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />

                <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                  {!isStreaming ? (
                    <>
                      <button 
                        className="btn btn-primary btn-lg gap-2"
                        onClick={startCamera}
                      >
                        <CameraIcon size={20} />
                        Start Camera
                      </button>
                      <button 
                        className="btn btn-outline btn-lg gap-2"
                        onClick={testCamera}
                      >
                        🧪 Test Camera
                      </button>
                    </>
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

                {/* Sync Status */}
                {(syncStatus !== 'idle' || syncMessage) && (
                  <div className={`alert mt-4 ${
                    syncStatus === 'success' ? 'alert-success' : 
                    syncStatus === 'error' ? 'alert-error' : 
                    'alert-info'
                  }`}>
                    <div className="flex items-center gap-2">
                      {syncStatus === 'syncing' && <span className="loading loading-spinner loading-sm"></span>}
                      {syncStatus === 'success' && <Check size={18} />}
                      {syncStatus === 'error' && <AlertCircle size={18} />}
                      <span className="text-sm">{syncMessage}</span>
                    </div>
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="mt-6 text-center space-y-4">
                    <div className="stats stats-horizontal bg-base-200 text-xs">
                      <div className="stat py-2 px-3">
                        <div className="stat-title text-xs">Total</div>
                        <div className="stat-value text-sm">{photos.length}</div>
                      </div>
                      <div className="stat py-2 px-3">
                        <div className="stat-title text-xs flex items-center gap-1">
                          <Cloud size={12} /> Synced
                        </div>
                        <div className="stat-value text-sm text-success">
                          {photos.filter(p => p.syncStatus === 'synced').length}
                        </div>
                      </div>
                      <div className="stat py-2 px-3">
                        <div className="stat-title text-xs flex items-center gap-1">
                          <CloudOff size={12} /> Local Only
                        </div>
                        <div className="stat-value text-sm text-warning">
                          {photos.filter(p => p.syncStatus === 'local_only').length}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Link to="/gallery" className="btn btn-primary btn-sm gap-2">
                        <Image size={16} />
                        View Gallery
                      </Link>
                      
                      {authService.isAuthenticated && photos.some(p => p.syncStatus === 'local_only') && (
                        <button 
                          className="btn btn-outline btn-sm gap-2"
                          onClick={syncAllPhotos}
                          disabled={syncStatus === 'syncing'}
                        >
                          {syncStatus === 'syncing' ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <Cloud size={16} />
                          )}
                          Sync All Photos
                        </button>
                      )}
                      
                      {!authService.isAuthenticated && (
                        <Link to="/signin" className="btn btn-outline btn-sm gap-2">
                          <Cloud size={16} />
                          Sign In to Sync
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                </>
                )}

                {/* Upload Mode */}
                {activeMode === 'upload' && (
                  <MobileFileUpload 
                    onFilesUploaded={handleFilesUploaded}
                    maxFiles={10}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavbar />
    </div>
  );
};

export default Camera;