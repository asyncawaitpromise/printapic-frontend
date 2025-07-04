import React from 'react';
import { LogOut, Settings, Camera, CreditCard, Image } from 'react-feather';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    
    // Show confirmation message
    const confirmLogout = window.confirm('Are you sure you want to sign out?');
    
    if (confirmLogout) {
      // Redirect to homepage
      navigate('/');
    }
  };

  return (
    <div className="btm-nav bg-base-100 border-t border-base-300 shadow-lg">
      <Link 
        to="/pricing" 
        className={isActive('/pricing') ? 'active text-primary' : 'text-base-content/70 hover:text-primary'}
        title="Pricing"
      >
        <CreditCard size={22} />
      </Link>
      <Link 
        to="/gallery" 
        className={isActive('/gallery') ? 'active text-primary' : 'text-base-content/70 hover:text-primary'}
        title="Gallery"
      >
        <Image size={22} />
      </Link>
      <Link 
        to="/camera" 
        className={isActive('/camera') ? 'active text-primary' : 'text-base-content/70 hover:text-primary'}
        title="Camera"
      >
        <Camera size={22} />
      </Link>
      <button 
        onClick={() => navigate('/settings')}
        className={isActive('/settings') ? 'active text-primary' : 'text-base-content/70 hover:text-primary'}
        title="Settings"
      >
        <Settings size={22} />
      </button>
      <button 
        onClick={handleLogout}
        className="text-base-content/70 hover:text-error"
        title="Sign Out"
      >
        <LogOut size={22} />
      </button>
    </div>
  );
};

export default BottomNavbar; 