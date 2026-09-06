import type { JSX } from 'react';
import { useEffect, useRef, type ReactNode } from 'react';
export const Reveal = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove('reveal-pending');
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    el.classList.add('reveal-pending');
    observer.observe(el);
    return (): void => {
      observer.disconnect();
      el.classList.remove('reveal-pending');
    };
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
};
