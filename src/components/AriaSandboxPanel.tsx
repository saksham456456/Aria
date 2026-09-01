import React, { useState } from 'react';

interface AriaSandboxPanelProps {
  onInjectTranscript: (text: string, speakerName: string, role: 'student' | 'teacher') => void;
  onTestVoice: (text: string) => void;
  onClose: () => void;
}

export const AriaSandboxPanel: React.FC<AriaSandboxPanelProps> = ({
  onInjectTranscript,
  onTestVoice,
  onClose
}) => {
  const [customText, setCustomText] = useState('');

  const injectScenario = (scenario: 'confusion' | 'quiz') => {
    if (scenario === 'confusion') {
      onInjectTranscript("Wait, I don't understand how the denominator works here.", "Student 1", "student");
      setTimeout(() => {
        onInjectTranscript("Yeah, why did the sign change suddenly? I'm lost too.", "Student 2", "student");
      }, 500);
    } else if (scenario === 'quiz') {
      onInjectTranscript("ARIA, can you give the class a quick spoken quiz on this topic?", "Teacher", "teacher");
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-1">
      <div className="p-4 border-b border-surface-3 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-warning-amber">🧪 Developer Sandbox</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">×</button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-6">

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">1. End-to-End Simulation</label>
          <div className="space-y-2">
            <button
              onClick={() => injectScenario('confusion')}
              className="w-full text-left p-3 rounded-xl bg-surface-2 border border-surface-3 hover:border-warning-amber transition-colors text-xs text-gray-200"
            >
              <span className="block font-semibold text-white mb-1">Simulate Learning Gap</span>
              Injects two confused students. ARIA should analyze this, update the DB, and explain the concept.
            </button>
            <button
              onClick={() => injectScenario('quiz')}
              className="w-full text-left p-3 rounded-xl bg-surface-2 border border-surface-3 hover:border-warning-amber transition-colors text-xs text-gray-200"
            >
              <span className="block font-semibold text-white mb-1">Trigger Quiz Request</span>
              Injects a teacher request. ARIA should respond with an interactive question.
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">2. Test Audio Output</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type to test TTS..."
              className="flex-1 bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button
              onClick={() => { onTestVoice(customText || "Testing audio systems. Can you hear me?"); setCustomText(''); }}
              className="px-3 py-2 bg-warning-amber text-black rounded-lg text-xs font-bold"
            >
              Speak
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Bypasses the LLM and directly pings the ElevenLabs route, capturing the stream via Agora.</p>
        </div>

      </div>
    </div>
  );
};
