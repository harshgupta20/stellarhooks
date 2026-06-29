"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/shared/copy-button";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { type ApiKeyWithSecret } from "@/features/api-keys/types";

export function ApiKeyCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<ApiKeyWithSecret | null>(null);

  const reset = () => {
    setName("");
    setCreated(null);
  };

  const onCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const key = await apiFetch<ApiKeyWithSecret>("/api/api-keys", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setCreated(key);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not create key");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New API key
        </Button>
      </DialogTrigger>
      <DialogContent>
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>API key created</DialogTitle>
              <DialogDescription>
                Copy it now — for security we only show it once.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-muted-foreground">
                Use it as a Bearer token: <code className="font-mono">Authorization: Bearer …</code>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3">
              <code className="flex-1 break-all font-mono text-sm">{created.key}</code>
              <CopyButton value={created.key} label="Copy API key" />
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>Authenticate the SDK and REST API.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                placeholder="Production server"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onCreate()}
              />
            </div>
            <DialogFooter>
              <Button onClick={onCreate} disabled={submitting || !name.trim()}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Create key
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
