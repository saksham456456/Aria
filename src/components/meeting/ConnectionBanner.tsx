/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ConnectionBanner({ state }: any) {
  if (state === 'connected' || state === 'idle') return null;
  return <div className="bg-yellow-500 text-black p-2 text-center text-sm font-medium">
     Connection State: {state}
  </div>;
}
