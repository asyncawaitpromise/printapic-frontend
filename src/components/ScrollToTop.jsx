import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Do nothing on gallery route - let gallery handle its own scroll behavior
    if (pathname === '/gallery') {
      return;
    }

    // For all other routes, scroll to top
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;