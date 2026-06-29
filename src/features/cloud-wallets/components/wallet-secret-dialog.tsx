"use client";

import { ShieldAlert } from "lucide-react";

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

export function WalletSecretDialog({
  publicKey,
  secret,
  open,
  onOpenChange,
}: {
  publicKey: string;
  secret: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Back up your secret key</DialogTitle>
          <DialogDescription>
            This is the only time the secret key is shown. Store it somewhere safe.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-muted-foreground">
            Anyone with this secret key has full control of the wallet&apos;s funds. Never share
            it. We store an encrypted copy so the app can sign payments for you.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Public key</p>
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2.5">
              <code className="flex-1 break-all font-mono text-xs">{publicKey}</code>
              <CopyButton value={publicKey} label="Copy public key" />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Secret key</p>
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-muted/40 p-2.5">
              <code className="flex-1 break-all font-mono text-xs">{secret}</code>
              {secret && <CopyButton value={secret} label="Copy secret key" />}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>I&apos;ve saved it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
