import React from 'react';
import { Cloud, CloudOff } from 'react-feather';

const PhotoStats = ({ photos }) => {
  const totalPhotos = photos.length;
  const syncedPhotos = photos.filter(p => p.hasRemote).length;
  const localOnlyPhotos = photos.filter(p => p.hasLocal && !p.hasRemote).length;
  const latestPhoto = photos[0];

  return (
    <div className="stats shadow mb-4 sm:mb-6 w-full text-xs sm:text-sm">
      <div className="stat py-3 sm:py-4">
        <div className="stat-title text-xs">Total Photos</div>
        <div className="stat-value text-lg sm:text-2xl text-primary">{totalPhotos}</div>
        <div className="stat-desc text-xs">All photos</div>
      </div>
      <div className="stat py-3 sm:py-4">
        <div className="stat-title text-xs flex items-center gap-1">
          <Cloud size={12} /> Synced
        </div>
        <div className="stat-value text-lg sm:text-2xl text-success">
          {syncedPhotos}
        </div>
        <div className="stat-desc text-xs">Cloud backup</div>
      </div>
      <div className="stat py-3 sm:py-4">
        <div className="stat-title text-xs flex items-center gap-1">
          <CloudOff size={12} /> Local Only
        </div>
        <div className="stat-value text-lg sm:text-2xl text-warning">
          {localOnlyPhotos}
        </div>
        <div className="stat-desc text-xs">Not synced</div>
      </div>
      <div className="stat py-3 sm:py-4">
        <div className="stat-title text-xs">Latest Photo</div>
        <div className="stat-value text-lg sm:text-2xl text-accent">
          {latestPhoto ? new Date(latestPhoto?.timestamp || latestPhoto?.created).toLocaleDateString() : 'None'}
        </div>
        <div className="stat-desc text-xs">
          {latestPhoto ? new Date(latestPhoto?.timestamp || latestPhoto?.created).toLocaleTimeString() : ''}
        </div>
      </div>
    </div>
  );
};

export default PhotoStats;