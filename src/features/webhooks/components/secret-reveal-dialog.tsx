"use client";

import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";

export function SecretRevealDialog({
  secret,
  open,
  onOpenChange,
}: {
  secret: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signing secret</DialogTitle>
          <DialogDescription>
            Use this secret to verify the HMAC-SHA256 signature on every webhook.
          </DialogDescription>
        </DialogHeader>

        <div className="border-warning/40 bg-warning/10 flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertTriangle className="text-warning mt-0.5 size-4 shrink-0" />
          <p className="text-muted-foreground">
            Copy it now — for security we only show it once. You can rotate it later if needed.
          </p>
        </div>

        <div className="bg-muted/40 flex items-center gap-2 rounded-md border p-3">
          <code className="flex-1 font-mono text-sm break-all">{secret}</code>
          {secret && <CopyButton value={secret} label="Copy secret" />}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
