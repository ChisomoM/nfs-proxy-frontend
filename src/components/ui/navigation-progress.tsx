"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
// import { usePathname, useSearchParams } from "next/navigation";
// Using React Router instead for Vite projects
import { useLocation } from "react-router-dom";

interface NavigationProgressContextType {
  startProgress: () => void;
}

const NavigationProgressContext = createContext<NavigationProgressContextType>({
  startProgress: () => {},
});

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPathnameRef = useRef(pathname);
  const lastSearchParamsRef = useRef(searchParams?.toString());

  const startProgress = useCallback(() => {
    console.log("🚀 Progress started!");
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Store current pathname before navigation
    lastPathnameRef.current = pathname;
    lastSearchParamsRef.current = searchParams?.toString();
    
    setIsLoading(true);
    setProgress(10);
  }, [pathname, searchParams]);

  // Simulate progress while loading - slower and more realistic
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 90%
        if (prev >= 90) return prev;
        if (prev >= 70) return prev + Math.random() * 3; // Very slow near the end
        if (prev >= 50) return prev + Math.random() * 5; // Slower in middle
        return prev + Math.random() * 10; // Normal speed at start
      });
    }, 400); // Slower interval

    return () => clearInterval(interval);
  }, [isLoading]);

  // Complete when route changes
  useEffect(() => {
    // Only complete if we're loading AND the route actually changed
    if (!isLoading) return;
    
    const currentPath = pathname;
    const currentSearch = searchParams?.toString();
    const hasPathChanged = currentPath !== lastPathnameRef.current;
    const hasSearchChanged = currentSearch !== lastSearchParamsRef.current;
    
    if (hasPathChanged || hasSearchChanged) {
      console.log("✅ Route actually changed!", { 
        from: lastPathnameRef.current, 
        to: currentPath,
        fromSearch: lastSearchParamsRef.current,
        toSearch: currentSearch
      });
      
      // Clear the auto-hide timeout since route actually changed
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setProgress(100);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isLoading]);

  // Listen for all clicks that might trigger navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      const button = target.closest("button");
      
      // Check for link navigation
      if (link?.href && !link.target && !link.download && !link.href.startsWith("mailto:") && !link.href.startsWith("tel:")) {
        try {
          const url = new URL(link.href);
          const currentUrl = new URL(window.location.href);
          
          if (url.origin === currentUrl.origin && 
              (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search)) {
            console.log("🔗 Link click navigation detected");
            startProgress();
          }
        } catch {
          // Invalid URL, ignore
        }
      }
      // Check for button clicks that might trigger navigation
      else if (button) {
        console.log("🔘 Button click detected - starting progress preemptively");
        startProgress();
        
        // If no route change after 10 seconds, assume no navigation and hide
        timeoutRef.current = setTimeout(() => {
          console.log("⏱️ Timeout - hiding progress bar (no navigation detected)");
          setIsLoading(false);
          setProgress(0);
        }, 10000);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [startProgress]);

  return (
    <NavigationProgressContext.Provider value={{ startProgress }}>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-2 bg-transparent pointer-events-none">
          <div 
            className="h-full bg-blue transition-all duration-200 ease-out shadow-lg shadow-blue/50"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {children}
    </NavigationProgressContext.Provider>
  );
}
