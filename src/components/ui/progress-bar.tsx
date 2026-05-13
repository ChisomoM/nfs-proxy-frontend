"use client";

import { useEffect, useState } from "react";

export function ProgressBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading immediately
    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stop at 90% until route loads
        return prev + Math.random() * 10;
      });
    }, 300);

    // Complete after route change
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, []);

  // Also listen for link clicks to start loading immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href && !link.target && !link.download) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Check if it's a different page
        if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
          setIsLoading(true);
          setProgress(20); // Start at 20% immediately
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-transparent pointer-events-none">
      <div 
        className="h-full bg-blue transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
