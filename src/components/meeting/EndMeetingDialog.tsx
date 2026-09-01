'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PhoneOff } from "lucide-react";

interface EndMeetingDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function EndMeetingDialog({ isOpen, onConfirm, onCancel }: EndMeetingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-red-950/50 flex items-center justify-center mb-4 border border-red-900/50">
            <PhoneOff className="w-6 h-6 text-red-500" />
          </div>
          <DialogTitle className="text-center text-xl">End Class?</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            This will end the session for all participants and generate the post-session summary using ARIA.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-center mt-4">
          <Button variant="outline" onClick={onCancel} className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            End Class
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
