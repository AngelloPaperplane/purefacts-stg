'use client';

import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration = 800): number {
  const [current, setCurrent] = useState(target);
  const prevTarget = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevTarget.current === target) return;
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(start + diff * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setCurrent(target);
        prevTarget.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return current;
}
