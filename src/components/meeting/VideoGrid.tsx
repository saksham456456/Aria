import React, { Children, ReactNode } from 'react';

export default function VideoGrid({ children }: { children: ReactNode }) {
  const childArray = Children.toArray(children);
  const count = childArray.length;

  let gridCols = 'grid-cols-1';
  if (count === 2) gridCols = 'sm:grid-cols-2';
  else if (count >= 3 && count <= 4) gridCols = 'sm:grid-cols-2';
  else if (count >= 5 && count <= 9) gridCols = 'sm:grid-cols-3';
  else if (count > 9) gridCols = 'sm:grid-cols-4';

  return (
    <div className="flex-1 overflow-hidden p-4 flex items-center justify-center bg-black/10">
      <div className={`w-full max-w-7xl mx-auto h-full grid ${gridCols} gap-4 auto-rows-fr content-center`}>
        {children}
      </div>
    </div>
  );
}
