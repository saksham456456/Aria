'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Play, Pause, MessageSquareWarning } from 'lucide-react';
import { AriaMode } from '@/hooks/aria/useAria';

interface AriaPanelProps {
  ariaMode: AriaMode;
  onSetAriaMode: (mode: AriaMode) => void;
  ariaPaused: boolean;
  onPauseAria: () => void;
  onResumeAria: () => void;
  onForceIntervene: () => void;
  onClose: () => void;
}

export default function AriaPanel({
  ariaMode,
  onSetAriaMode,
  ariaPaused,
  onPauseAria,
  onResumeAria,
  onForceIntervene,
  onClose
}: AriaPanelProps) {

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200">
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          ARIA Controls
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Power State</h3>
            <div className="flex items-center gap-2">
              {ariaPaused ? (
                <Button onClick={onResumeAria} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                  <Play className="w-4 h-4 mr-2" /> Resume ARIA
                </Button>
              ) : (
                <Button onClick={onPauseAria} variant="secondary" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
                  <Pause className="w-4 h-4 mr-2" /> Pause ARIA
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Intervention Mode</h3>
            <Select value={ariaMode} onValueChange={(val) => onSetAriaMode(val as AriaMode)} disabled={ariaPaused}>
              <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="auto">Auto (Analyzes and speaks)</SelectItem>
                <SelectItem value="manual">Manual (Waits for teacher)</SelectItem>
                <SelectItem value="silent">Silent (Observer only)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              {ariaMode === 'auto' && 'ARIA will intervene automatically based on classroom context.'}
              {ariaMode === 'manual' && 'ARIA will only speak when you explicitly ask it to.'}
              {ariaMode === 'silent' && 'ARIA will not speak, but will continue to analyze the session.'}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Manual Override</h3>
            <Button
              variant="outline"
              disabled={ariaPaused}
              onClick={onForceIntervene}
              className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
            >
              <MessageSquareWarning className="w-4 h-4 mr-2" />
              Force Explanation Now
            </Button>
            <p className="text-xs text-zinc-500 text-center">
              Make ARIA provide a simplified explanation of the current topic immediately.
            </p>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
