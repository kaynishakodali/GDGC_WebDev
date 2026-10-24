import { useEffect } from 'react';

const sparkColors = ['#F4A900', '#087E8B', '#E34234', '#FFD65A'];

/** Small, short-lived click feedback for links and controls across the site. */
export function ClickSpark() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return;
      const control = event.target.closest('button, a, [role="button"], input[type="checkbox"], input[type="radio"], select');
      if (!control || control.matches(':disabled,[aria-disabled="true"]')) return;

      const spark = document.createElement('span');
      const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      spark.className = 'artopia-click-spark';
      spark.style.left = `${event.clientX}px`;
      spark.style.top = `${event.clientY}px`;
      spark.style.setProperty('--spark-color', color);
      document.body.appendChild(spark);
      window.setTimeout(() => spark.remove(), 520);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, []);

  return null;
}
