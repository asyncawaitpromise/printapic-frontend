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
      console.log('📍 Saved Gallery scroll position:', galleryScrollPosition);
    }

    // Handle scroll behavior based on the new route
    if (pathname === '/gallery') {
      // Restore previous scroll position for gallery
      // Wait for content to render with progressive delays
      const restoreScrollPosition = () => {
        const targetPosition = galleryScrollPosition;
        console.log('📍 Attempting to restore Gallery scroll to:', targetPosition);
        
        if (targetPosition > 0) {
          // Check if page has enough height to scroll to target position
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          
          if (maxScroll >= targetPosition) {
            window.scrollTo(0, targetPosition);
            console.log('📍 Successfully restored scroll position to:', targetPosition);
          } else {
            // Page hasn't fully rendered yet, try again
            console.log('📍 Page height insufficient, retrying scroll restoration...');
            setTimeout(restoreScrollPosition, 100);
          }
        } else {
          // If no saved position (first visit), scroll to top
          window.scrollTo(0, 0);
        }
      };

      // Start restoration with multiple attempts
      setTimeout(restoreScrollPosition, 200); // Initial delay for React render
    } else if (prevPath === '/gallery') {
      // Only scroll to top when NOT returning to gallery
      // This prevents scroll-to-top from interfering with gallery scroll restoration
      console.log('📍 Navigating away from gallery - scroll to top');
      window.scrollTo(0, 0);
    } else {
      // Scroll to top for other route transitions (not involving gallery)
      window.scrollTo(0, 0);
    }

    // Update previous pathname for next navigation
    previousPathname.current = pathname;
  }, [pathname]);

  return null;
};

export default ScrollToTop;