'use client';

import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';

const layout = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.Center,
});

export default function RiveCheckmark({
  className = '',
}: {
  className?: string;
}) {
  const { RiveComponent } = useRive(
    {
      src: '/media/rive/checkmark.riv',
      artboard: 'New Artboard',
      stateMachines: 'State Machine 1',
      autoplay: true,
      layout,
    },
    {
      shouldUseIntersectionObserver: false,
      shouldResizeCanvasToContainer: true,
    },
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none h-6 w-6 overflow-hidden rounded-full border border-cyan/25 bg-cyan/10 ${className}`.trim()}
    >
      <RiveComponent aria-hidden className="h-full w-full" />
    </div>
  );
}
