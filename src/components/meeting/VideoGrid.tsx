/* eslint-disable @typescript-eslint/no-explicit-any */
export default function VideoGrid({ children }: any) {
  return <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr overflow-y-auto">{children}</div>;
}
