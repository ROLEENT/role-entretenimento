"use client";
import { useEffect, useState } from "react";

interface ReadingProgressProps {
  targetId: string;
}

export function ReadingProgress({ targetId }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = document.getElementById(targetId);
    if (!element) return;

    const onScroll = () => {
      const elementTop = element.offsetTop;
      const elementHeight = element.scrollHeight - window.innerHeight;
      const windowTop = window.scrollY - elementTop;
      
      const scrollProgress = Math.min(100, Math.max(0, (windowTop / elementHeight) * 100));
      setProgress(scrollProgress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Initial calculation
    
    return () => window.removeEventListener("scroll", onScroll);
  }, [targetId]);

  return (
    <div 
      style={{ width: `${progress}%` }} 
      className="fixed left-0 top-0 z-40 h-0.5 bg-primary transition-[width] duration-150"
      aria-hidden="true"
    />
  );
}