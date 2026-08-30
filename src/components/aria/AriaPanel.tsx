/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useAriaVoice } from '@/hooks/aria/useAriaVoice';

export default function AriaPanel({ sessionId, appUserId, onClose, onCommand }: any) {
  const { speak, isPlaying, error } = useAriaVoice(sessionId, appUserId);
  const [mode, setMode] = useState<'auto'|'manual'|'silent'>('auto');
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestVoice = async () => {
     setTestResult(null);
     try {
       await speak("Hello, I am ARIA, your AI teaching assistant. I am ready to help.");
       setTestResult('success');
     } catch {
       setTestResult('error');
     }
  };

  return (
    <div className="w-80 border-l border-gray-700 bg-gray-800 flex flex-col h-full text-white">
      <div className="p-4 border-b border-gray-700 flex justify-between">
         <h2 className="font-bold">ARIA Controls</h2>
         <button onClick={onClose}>&times;</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

         {/* Modes */}
         <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Mode</h3>
            <div className="flex flex-col gap-2">
               <button onClick={() => setMode('auto')} className={`text-left p-2 rounded border ${mode === 'auto' ? 'border-purple-500 bg-purple-900/50' : 'border-gray-600'}`}>
                  <strong>Auto</strong><br/><span className="text-xs text-gray-400">Intervenes when appropriate</span>
               </button>
               <button onClick={() => setMode('manual')} className={`text-left p-2 rounded border ${mode === 'manual' ? 'border-purple-500 bg-purple-900/50' : 'border-gray-600'}`}>
                  <strong>Manual</strong><br/><span className="text-xs text-gray-400">Only responds to commands</span>
               </button>
               <button onClick={() => setMode('silent')} className={`text-left p-2 rounded border ${mode === 'silent' ? 'border-purple-500 bg-purple-900/50' : 'border-gray-600'}`}>
                  <strong>Silent</strong><br/><span className="text-xs text-gray-400">Listens and records insights</span>
               </button>
            </div>
         </div>

         {/* Commands (Phase 8 integration) */}
         <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Commands</h3>
            <div className="grid grid-cols-1 gap-2">
               <button onClick={() => onCommand('Explain this')} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-left">Explain this</button>
               <button onClick={() => onCommand('Quiz the class')} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-left">Quiz the class</button>
               <button onClick={() => onCommand('Summarize so far')} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-left">Summarize so far</button>
               <button onClick={() => onCommand('What are students struggling with?')} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-left">Check learning gaps</button>
            </div>
         </div>

         {/* Interruption */}
         <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Interruption</h3>
            <button className="w-full p-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-bold">Pause ARIA</button>
         </div>

         {/* Test Voice */}
         <div className="space-y-2 pt-4 border-t border-gray-700">
            <button onClick={handleTestVoice} disabled={isPlaying} className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-bold disabled:opacity-50">
               {isPlaying ? 'Speaking...' : 'Test ARIA Voice'}
            </button>
            {testResult === 'success' && <div className="text-green-400 text-xs mt-1">✅ Success</div>}
            {testResult === 'error' && <div className="text-red-400 text-xs mt-1">❌ Error: {error}</div>}
         </div>

      </div>
    </div>
  );
}
