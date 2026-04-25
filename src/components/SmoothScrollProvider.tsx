'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.085,
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.05,
      syncTouch: false,
    });

    let frameId = 0;
    const handleScroll = () => ScrollTrigger.update();

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    lenis.on('scroll', handleScroll);
    frameId = window.requestAnimationFrame(raf);
    window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.off('scroll', handleScroll);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, []);

  return <>{children}</>;
}
