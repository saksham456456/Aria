import { ReactNode } from 'react';

export default function VideoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 overflow-auto p-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr h-full content-start">
        {children}
      </div>
    </div>
  );
}
