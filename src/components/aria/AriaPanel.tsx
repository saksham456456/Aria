import { useState } from 'react';
import { useAriaVoice } from '@/hooks/aria/useAriaVoice';
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { AriaMode } from '@/hooks/aria/useAria';

interface AriaPanelProps {
  appUserId: string;
  ariaMode: AriaMode;
  onModeChange: (mode: AriaMode) => void;
  ariaPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onCommand: (command: string) => void;
  agoraClient: IAgoraRTCClient | null; // Allow null to match the MeetingRoom state during initialization
  onClose: () => void;
}

export default function AriaPanel({
  appUserId,
  ariaMode,
  onModeChange,
  ariaPaused,
  onPause,
  onResume,
  onCommand,
  agoraClient,
  onClose
}: AriaPanelProps) {
  const { speak, isSpeaking, error } = useAriaVoice(appUserId);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestVoice = async () => {
     if (!agoraClient) {
       setTestResult('error');
       return;
     }
     setTestResult(null);
     try {
       await speak("Hello, I am ARIA, your AI teaching assistant. I am ready to help.", agoraClient);
       setTestResult('success');
     } catch {
       setTestResult('error');
     }
  };

  return (
    <div className="w-80 border-l border-surface-3 bg-surface-1 flex flex-col h-full text-white">
      <div className="p-4 border-b border-surface-3 flex justify-between items-center">
         <h2 className="font-bold">ARIA Controls</h2>
         <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
         </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

         {/* Modes */}
         <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mode</h3>
            <div className="flex flex-col gap-2">
               <button onClick={() => onModeChange('auto')} className={`text-left p-3 rounded-lg border transition-all ${ariaMode === 'auto' ? 'border-aria-purple bg-aria-purple-glow' : 'border-surface-3 hover:border-gray-500'}`}>
                  <strong className="block text-sm">Auto</strong>
                  <span className="text-xs text-gray-400 mt-1 block">Intervenes when appropriate</span>
               </button>
               <button onClick={() => onModeChange('manual')} className={`text-left p-3 rounded-lg border transition-all ${ariaMode === 'manual' ? 'border-aria-purple bg-aria-purple-glow' : 'border-surface-3 hover:border-gray-500'}`}>
                  <strong className="block text-sm">Manual</strong>
                  <span className="text-xs text-gray-400 mt-1 block">Only responds to commands</span>
               </button>
               <button onClick={() => onModeChange('silent')} className={`text-left p-3 rounded-lg border transition-all ${ariaMode === 'silent' ? 'border-aria-purple bg-aria-purple-glow' : 'border-surface-3 hover:border-gray-500'}`}>
                  <strong className="block text-sm">Silent</strong>
                  <span className="text-xs text-gray-400 mt-1 block">Listens and records insights</span>
               </button>
            </div>
         </div>

         {/* Commands */}
         <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Commands</h3>
            <div className="grid grid-cols-1 gap-2">
               <button onClick={() => onCommand('Explain this')} className="p-2.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-sm text-left border border-surface-3 transition-colors">Explain this</button>
               <button onClick={() => onCommand('Quiz the class')} className="p-2.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-sm text-left border border-surface-3 transition-colors">Quiz the class</button>
               <button onClick={() => onCommand('Summarize so far')} className="p-2.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-sm text-left border border-surface-3 transition-colors">Summarize so far</button>
               <button onClick={() => onCommand('What are students struggling with?')} className="p-2.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-sm text-left border border-surface-3 transition-colors">Check learning gaps</button>
            </div>
         </div>

         {/* Interruption */}
         <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Interruption</h3>
            {ariaPaused ? (
              <button onClick={onResume} className="w-full p-2.5 bg-connected-green hover:bg-green-600 rounded-lg text-sm font-semibold transition-colors">Resume ARIA</button>
            ) : (
              <button onClick={onPause} className="w-full p-2.5 bg-warning-amber hover:bg-amber-600 rounded-lg text-sm font-semibold transition-colors">Pause ARIA</button>
            )}
         </div>

         {/* Test Voice */}
         <div className="space-y-2 pt-6 border-t border-surface-3">
            <button onClick={handleTestVoice} disabled={isSpeaking || !agoraClient} className="w-full p-2.5 bg-aria-purple hover:bg-aria-purple-light text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
               {isSpeaking ? 'Speaking...' : 'Test ARIA Voice'}
            </button>
            {testResult === 'success' && <div className="text-connected-green text-xs mt-2 text-center">✅ Audio playing successfully</div>}
            {testResult === 'error' && <div className="text-live-red text-xs mt-2 text-center">❌ {error || 'Failed to play audio'}</div>}
         </div>

      </div>
    </div>
  );
}
