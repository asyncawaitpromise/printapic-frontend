import React, { useState, useEffect } from 'react';
import { LogOut, Settings, Camera, CreditCard, Image, ShoppingCart } from 'react-feather';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { cartService } from '../services/cartService.js';

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Load cart item count on mount and when location changes
  useEffect(() => {
    const updateCartCount = () => {
      const count = cartService.getCartItemCount();
      setCartItemCount(count);
    };
    
    updateCartCount();
    
    // Listen for storage changes (when cart is modified in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'printapic-cart') {
        updateCartCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also update when navigating (in case cart was modified on other pages)
    updateCartCount();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Show confirmation message
    const confirmLogout = window.confirm('Are you sure you want to sign out?');
    
    if (confirmLogout) {
      // Sign out using PocketBase
      signOut();
      // Redirect to homepage
      navigate('/');
    }
  };

  return (
    <div className="btm-nav bg-base-100 border-t border-base-300 shadow-lg flex">
      <div className="flex-grow-[1] cursor-default hidden sm:block"></div>
      <Link 
        to="/cart" 
        className={`${isActive('/cart') ? 'active text-primary' : 'text-base-content/70 hover:text-primary'} relative`}
        title="Shopping Cart"
      >
        <ShoppingCart size={22} />
        {cartItemCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-content text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </div>
        )}
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
      <div className="flex-grow-[1] cursor-default hidden sm:block"></div>
    </div>
  );
};

export default BottomNavbar; 