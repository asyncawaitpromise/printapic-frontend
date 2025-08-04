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
      // Use multiple strategies to ensure scroll restoration works
      const restoreScrollPosition = () => {
        const targetPosition = galleryScrollPosition;
        console.log('📍 Attempting to restore Gallery scroll to:', targetPosition);
        
        if (targetPosition > 0) {
          // Check if page has enough height to scroll to target position
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          
          if (maxScroll >= targetPosition) {
            // Use both scrollTo methods to ensure it works across browsers/scenarios
            window.scrollTo({ top: targetPosition, behavior: 'instant' });
            document.documentElement.scrollTop = targetPosition;
            console.log('📍 Successfully restored scroll position to:', targetPosition);
            
            // Verify the scroll actually happened and retry if needed
            setTimeout(() => {
              if (Math.abs(window.scrollY - targetPosition) > 10) {
                console.log('📍 Scroll verification failed, retrying...');
                window.scrollTo(0, targetPosition);
              }
            }, 50);
          } else {
            // Page hasn't fully rendered yet, try again with longer delay
            console.log('📍 Page height insufficient, retrying scroll restoration...');
            setTimeout(restoreScrollPosition, 150);
          }
        } else {
          // If no saved position (first visit), scroll to top
          window.scrollTo(0, 0);
        }
      };

      // Multiple restoration attempts with increasing delays
      setTimeout(restoreScrollPosition, 100); // Quick attempt
      setTimeout(restoreScrollPosition, 300); // Fallback attempt
    } else {
      // For all non-gallery routes, scroll to top
      // This includes when navigating away from gallery
      console.log('📍 Navigating to non-gallery route - scroll to top');
      window.scrollTo(0, 0);
    }

    // Update previous pathname for next navigation
    previousPathname.current = pathname;
  }, [pathname]);

  return null;
};

export default ScrollToTop;