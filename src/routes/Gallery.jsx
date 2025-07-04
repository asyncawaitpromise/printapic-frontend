import React, { useState, useEffect } from 'react';
import { Image, Trash2, Check, ArrowLeft, Camera as CameraIcon } from 'react-feather';
import { useNavigate, Link } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';

const Gallery = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);

  // Load photos from localStorage on component mount
  useEffect(() => {
    console.log('🖼️ Gallery component mounted');
    const savedPhotos = localStorage.getItem('captured-photos');
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(savedPhotos);
        console.log('🖼️ Loaded photos from localStorage:', parsedPhotos.length, 'photos');
        setPhotos(parsedPhotos);
      } catch (e) {
        console.error('🖼️ Error loading photos from localStorage:', e);
      }
    } else {
      console.log('🖼️ No saved photos found in localStorage');
    }
  }, []);

  // Save photos to localStorage whenever photos state changes
  useEffect(() => {
    localStorage.setItem('captured-photos', JSON.stringify(photos));
    console.log('🖼️ Photos saved to localStorage:', photos.length, 'photos');
  }, [photos]);

  // Delete photo
  const deletePhoto = (photoId) => {
    console.log('🗑️ Deleting photo:', photoId);
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  // Convert to sticker (placeholder)
  const convertToSticker = (photoId) => {
    console.log('🎯 Converting photo to sticker:', photoId);
    // Placeholder function for future sticker conversion
    alert(`Converting photo ${photoId} to sticker - This feature will be implemented later!`);
  };

  // Clear all photos
  const clearAllPhotos = () => {
    if (window.confirm(`Are you sure you want to delete all ${photos.length} photos? This action cannot be undone.`)) {
      console.log('🗑️ Clearing all photos');
      setPhotos([]);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pb-20">

      {/* Gallery Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Your Photos</h2>
            <p className="text-base-content/70">
              {photos.length === 0 
                ? 'No photos captured yet. Take your first photo to get started!'
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
                <Link to="/camera" className="btn btn-primary gap-2">
                  <CameraIcon size={20} />
                  Take a Photo
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <div className="stats shadow mb-6 w-full">
                <div className="stat">
                  <div className="stat-title">Total Photos</div>
                  <div className="stat-value text-primary">{photos.length}</div>
                  <div className="stat-desc">Captured photos</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Storage Used</div>
                  <div className="stat-value text-secondary">
                    {(JSON.stringify(photos).length / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <div className="stat-desc">In local storage</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Latest Photo</div>
                  <div className="stat-value text-accent">
                    {new Date(photos[0]?.timestamp).toLocaleDateString()}
                  </div>
                  <div className="stat-desc">
                    {new Date(photos[0]?.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                    <figure className="aspect-video relative">
                      <img 
                        src={photo.data} 
                        alt={`Captured ${new Date(photo.timestamp).toLocaleDateString()}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Photo number badge */}
                      <div className="absolute top-2 left-2 badge badge-primary badge-sm">
                        #{photos.length - index}
                      </div>
                      {/* Photo dimensions badge */}
                      <div className="absolute top-2 right-2 badge badge-neutral badge-sm">
                        {photo.width}×{photo.height}
                      </div>
                    </figure>
                    <div className="card-body p-4">
                      <div className="text-sm text-base-content/70 mb-3">
                        <div className="font-medium">
                          {new Date(photo.timestamp).toLocaleDateString()}
                        </div>
                        <div>
                          {new Date(photo.timestamp).toLocaleTimeString()}
                        </div>
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

              {/* Action buttons at bottom */}
              <div className="mt-8 text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/camera" className="btn btn-primary btn-lg gap-2">
                    <CameraIcon size={20} />
                    Take More Photos
                  </Link>
                  <button 
                    className="btn btn-outline btn-lg"
                    onClick={() => {
                      const selectedPhotos = photos.slice(0, 5); // Example: select first 5 photos
                      alert(`Batch processing ${selectedPhotos.length} photos - This feature will be implemented later!`);
                    }}
                  >
                    Batch Convert to Stickers
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default Gallery;