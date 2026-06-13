'use client';

import { Share, PlusSquare, CheckSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const STEPS = [
  { icon: Share, text: 'Tap the Share button in Safari' },
  { icon: PlusSquare, text: 'Tap "Add to Home Screen"' },
  { icon: CheckSquare, text: 'Tap "Add" in the top right' },
];

interface AddToHomeScreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToHomeScreenModal({ open, onOpenChange }: AddToHomeScreenModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Install BazaarLens</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Push notifications require the app to be installed to your Home Screen.
          </DialogDescription>
        </DialogHeader>
        <ol className="mt-2 space-y-4">
          {STEPS.map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-center gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <span className="text-sm text-foreground">{text}</span>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
