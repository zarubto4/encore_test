import { useEffect, useState } from 'react';

const mediaQueryString = '(min-width: 768px)';

function useIsLargeScreen() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(mediaQueryString);

    // Set the initial state
    setIsLargeScreen(mediaQuery.matches);

    // Handler for media query change
    const handleResize = (e: MediaQueryListEvent) => {
      setIsLargeScreen(e.matches);
    };

    // Add event listener for media query change
    mediaQuery.addEventListener('change', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []);

  return isLargeScreen;
}

export default useIsLargeScreen;
