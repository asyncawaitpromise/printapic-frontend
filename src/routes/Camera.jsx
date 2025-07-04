import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, Image, ArrowLeft, RotateCcw, Maximize, Minimize, X } from 'react-feather';
import { useNavigate, Link } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';

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
  const containerRef = useRef(null);

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
  const capturePhoto = () => {
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
      height: canvas.height
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

  // Handle fullscreen change events and keyboard shortcuts
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

    const handleKeyDown = (event) => {
      if (isFullscreen && isStreaming) {
        switch (event.code) {
          case 'Space':
            event.preventDefault();
            console.log('⌨️ Space pressed - capturing photo');
            capturePhoto();
            break;
          case 'Escape':
            console.log('⌨️ Escape pressed - exiting fullscreen');
            toggleFullscreen();
            break;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, isStreaming]);

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
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Take a Photo</h2>
                
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

                <div 
                  ref={containerRef}
                  className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'}`}
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
                        <CameraIcon size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Camera not active</p>
                        <p className="text-sm opacity-70">Click "Start Camera" to begin</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Camera controls overlay */}
                  {isStreaming && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        className="btn btn-circle btn-sm bg-black/50 text-white border-white/30 hover:bg-black/70"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                      >
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                      </button>
                      <button
                        className="btn btn-circle btn-sm bg-black/50 text-white border-white/30 hover:bg-black/70"
                        onClick={switchCamera}
                        title="Switch Camera"
                      >
                        <RotateCcw size={16} />
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
                        ?
                      </button>
                    </div>
                  )}

                  {/* Fullscreen capture button */}
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
                      
                      {/* Fullscreen help text */}
                      <div className="absolute bottom-4 left-4 text-white/70 text-sm">
                        <div>Press <kbd className="kbd kbd-xs">Space</kbd> to capture</div>
                        <div>Press <kbd className="kbd kbd-xs">Esc</kbd> to exit fullscreen</div>
                      </div>
                    </>
                  )}

                  {/* Last captured photo preview */}
                  {lastCapturedPhoto && isStreaming && (
                    <div className="absolute bottom-4 right-4 w-20 h-20 bg-white rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src={lastCapturedPhoto.data} 
                        alt="Last captured" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute -top-2 -right-2 btn btn-circle btn-xs bg-red-500 text-white border-none hover:bg-red-600"
                        onClick={() => setLastCapturedPhoto(null)}
                        title="Close preview"
                      >
                        <X size={12} />
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

                {photos.length > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-base-content/70">
                      You have {photos.length} photo{photos.length !== 1 ? 's' : ''} saved.{' '}
                      <Link to="/gallery" className="link link-primary">
                        View Gallery
                      </Link>
                    </p>
                  </div>
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