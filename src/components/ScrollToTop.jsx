import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Store gallery scroll position outside component to persist across route changes
let galleryScrollPosition = 0;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const prevPath = previousPathname.current;
    
    // Save gallery scroll position when leaving gallery
    if (prevPath === '/gallery' && pathname !== '/gallery') {
      galleryScrollPosition = window.scrollY;
    }

    // Handle scroll behavior based on the new route
    if (pathname === '/gallery') {
      // Restore previous scroll position for gallery
      // Use setTimeout to ensure DOM has rendered
      setTimeout(() => {
        window.scrollTo(0, galleryScrollPosition);
      }, 100);
    } else {
      // Scroll to top for all other routes (PhotoView, etc.)
      window.scrollTo(0, 0);
    }

    // Update previous pathname for next navigation
    previousPathname.current = pathname;
  }, [pathname]);

  return null;
};

export default ScrollToTop;