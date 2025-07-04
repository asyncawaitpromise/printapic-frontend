import React from 'react';
import { Home, Info, Camera, CreditCard, Image } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';

const BottomNavbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="btm-nav bg-base-100 border-t border-base-300 shadow-lg">
      <Link 
        to="/" 
        className={isActive('/') ? 'active text-primary' : 'text-base-content/70 hover:text-primary'}
      >
        <Home size={22} />
      </Link>
      <button 
        onClick={() => {
          if (location.pathname === '/') {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.href = '/#how-it-works';
          }
        }}
        className="text-base-content/70 hover:text-primary"
      >
        <Info size={22} />
      </button>
      <Link 
        to="/camera" 
        className={isActive('/camera') ? 'active text-primary' : 'text-base-content/70 hover:text-primary'}
      >
        <Camera size={22} />
      </Link>
      <Link 
        to="/gallery" 
        className={isActive('/gallery') ? 'active text-primary' : 'text-base-content/70 hover:text-primary'}
      >
        <Image size={22} />
      </Link>
      <button 
        onClick={() => {
          if (location.pathname === '/') {
            document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.href = '/#pricing';
          }
        }}
        className="text-base-content/70 hover:text-primary"
      >
        <CreditCard size={22} />
      </button>
    </div>
  );
};

export default BottomNavbar; 