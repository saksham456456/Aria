import React, { Children, ReactNode } from 'react';

export default function VideoGrid({ children }: { children: ReactNode }) {
  const childArray = Children.toArray(children);
  const count = childArray.length;

  let gridCols = 'grid-cols-1';
  if (count === 2) gridCols = 'grid-cols-1 sm:grid-cols-2';
  else if (count >= 3 && count <= 4) gridCols = 'grid-cols-2';
  else if (count >= 5 && count <= 6) gridCols = 'grid-cols-2 lg:grid-cols-3';
  else if (count >= 7 && count <= 9) gridCols = 'grid-cols-3';
  else if (count > 9) gridCols = 'grid-cols-3 xl:grid-cols-4';

  return (
    <div className="flex-1 overflow-hidden p-3 sm:p-4 flex items-center justify-center pb-24">
      <div className={`w-full max-w-7xl mx-auto h-full grid ${gridCols} gap-2 sm:gap-3 auto-rows-fr content-center ${
        count === 1 ? 'max-w-4xl max-h-[75vh]' :
        count === 2 ? 'max-w-5xl max-h-[70vh]' : ''
      }`}>
        {children}
      </div>
    </div>
  );
}
