import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Store gallery scroll position outside component to persist across route changes
let galleryScrollPosition = 0;

// Helper function to get the actual scroll position from various containers
const getScrollPosition = () => {
  // Check multiple scroll containers to find the actual scrolling element
  const windowScroll = window.scrollY || window.pageYOffset;
  const documentScroll = document.documentElement.scrollTop;
  const bodyScroll = document.body.scrollTop;
  
  // Find the maximum scroll value (the actual scrolling element)
  const maxScroll = Math.max(windowScroll, documentScroll, bodyScroll);
  
  console.log('📏 Scroll positions - window:', windowScroll, 'documentElement:', documentScroll, 'body:', bodyScroll, 'max:', maxScroll);
  
  return maxScroll;
};

// Helper function to set scroll position on various containers
const setScrollPosition = (position) => {
  console.log('📍 Setting scroll position to:', position);
  
  // Set scroll on multiple containers to ensure it works
  window.scrollTo(0, position);
  document.documentElement.scrollTop = position;
  document.body.scrollTop = position;
  
  // Also try the smooth scroll approach as fallback
  window.scrollTo({ top: position, behavior: 'instant' });
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const prevPath = previousPathname.current;
    
    // Save gallery scroll position when leaving gallery
    if (prevPath === '/gallery' && pathname !== '/gallery') {
      galleryScrollPosition = getScrollPosition();
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
            // Use helper function to set scroll position across all containers
            setScrollPosition(targetPosition);
            console.log('📍 Successfully restored scroll position to:', targetPosition);
            
            // Verify the scroll actually happened and retry if needed
            setTimeout(() => {
              const currentScroll = getScrollPosition();
              if (Math.abs(currentScroll - targetPosition) > 10) {
                console.log('📍 Scroll verification failed, current:', currentScroll, 'target:', targetPosition, 'retrying...');
                setScrollPosition(targetPosition);
              }
            }, 100);
          } else {
            // Page hasn't fully rendered yet, try again with longer delay
            console.log('📍 Page height insufficient (max:', maxScroll, 'target:', targetPosition, '), retrying scroll restoration...');
            setTimeout(restoreScrollPosition, 200);
          }
        } else {
          // If no saved position (first visit), scroll to top
          setScrollPosition(0);
        }
      };

      // Multiple restoration attempts with increasing delays
      setTimeout(restoreScrollPosition, 100); // Quick attempt
      setTimeout(restoreScrollPosition, 300); // Fallback attempt
    } else {
      // For all non-gallery routes, scroll to top
      // This includes when navigating away from gallery
      console.log('📍 Navigating to non-gallery route - scroll to top');
      setScrollPosition(0);
    }

    // Update previous pathname for next navigation
    previousPathname.current = pathname;
  }, [pathname]);

  return null;
};

export default ScrollToTop;