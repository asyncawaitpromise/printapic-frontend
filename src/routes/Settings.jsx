import React, { useState, useEffect } from 'react';
import { User, Mail, Bell, Moon, Sun, Trash2, Camera, Image, CreditCard, LogOut, Save } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
    quality: 'high'
  });
  const [stats, setStats] = useState({
    photosCount: 0,
    tokensUsed: 0,
    stickersOrdered: 0
  });

  // Load user data and settings on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load user stats
    const photos = localStorage.getItem('captured-photos');
    if (photos) {
      const photosArray = JSON.parse(photos);
      setStats(prev => ({
        ...prev,
        photosCount: photosArray.length
      }));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    // Show success message (in a real app, this would be a toast notification)
    alert('Settings saved successfully!');
  };

  // Handle setting changes
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle logout
  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to sign out?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      localStorage.removeItem('userSettings');
      navigate('/');
    }
  };

  // Clear all data
  const handleClearData = () => {
    const confirmClear = window.confirm(
      'This will delete all your photos and reset your account. This action cannot be undone. Are you sure?'
    );
    if (confirmClear) {
      localStorage.removeItem('captured-photos');
      localStorage.removeItem('userSettings');
      setStats({ photosCount: 0, tokensUsed: 0, stickersOrdered: 0 });
      alert('All data cleared successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
            <p className="text-sm sm:text-base text-base-content/70">
              Manage your account and preferences
            </p>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title gap-2 mb-4">
                  <User size={20} />
                  Profile
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-base-content/60" />
                    <span className="text-sm sm:text-base">{user.email}</span>
                    {user.provider === 'google' && (
                      <div className="badge badge-primary badge-sm">Google</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-base-content/60">Member since:</span>
                    <span className="text-sm">{new Date(user.signedInAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title mb-4">Your Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Camera size={24} className="text-primary" />
                  </div>
                  <div className="text-xl font-bold text-primary">{stats.photosCount}</div>
                  <div className="text-xs text-base-content/60">Photos</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <CreditCard size={24} className="text-secondary" />
                  </div>
                  <div className="text-xl font-bold text-secondary">{stats.tokensUsed}</div>
                  <div className="text-xs text-base-content/60">Tokens Used</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Image size={24} className="text-accent" />
                  </div>
                  <div className="text-xl font-bold text-accent">{stats.stickersOrdered}</div>
                  <div className="text-xs text-base-content/60">Stickers</div>
                </div>
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title gap-2 mb-4">
                <Bell size={20} />
                App Settings
              </h2>
              
              <div className="space-y-4">
                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-base-content/60">Get notified about order updates</div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {settings.darkMode ? <Moon size={16} /> : <Sun size={16} />}
                      Dark Mode
                    </div>
                    <div className="text-sm text-base-content/60">Switch between light and dark themes</div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                </div>

                {/* Auto Save */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Save Photos</div>
                    <div className="text-sm text-base-content/60">Automatically save photos to gallery</div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  />
                </div>

                {/* Photo Quality */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Photo Quality</div>
                    <div className="text-sm text-base-content/60">Choose capture quality</div>
                  </div>
                  <select
                    className="select select-bordered select-sm"
                    value={settings.quality}
                    onChange={(e) => handleSettingChange('quality', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Save Settings Button */}
              <div className="mt-6">
                <button
                  onClick={saveSettings}
                  className="btn btn-primary gap-2 w-full sm:w-auto"
                >
                  <Save size={16} />
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title text-error mb-4">Account Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleClearData}
                  className="btn btn-outline btn-error gap-2 w-full"
                >
                  <Trash2 size={16} />
                  Clear All Data
                </button>
                
                <button
                  onClick={handleLogout}
                  className="btn btn-error gap-2 w-full"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>

              <div className="text-xs text-base-content/50 mt-4">
                <p>Clear All Data will permanently delete all your photos and reset your account.</p>
                <p>Sign Out will log you out but keep your data safe.</p>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">About</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>App Version:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>December 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Used:</span>
                  <span>{(JSON.stringify(localStorage).length / 1024 / 1024).toFixed(1)}MB</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-base-300">
                <div className="flex flex-wrap gap-2 text-xs">
                  <a href="/terms" className="link link-primary">Terms of Service</a>
                  <span>•</span>
                  <a href="/privacy" className="link link-primary">Privacy Policy</a>
                  <span>•</span>
                  <a href="/help" className="link link-primary">Help & Support</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default Settings; 