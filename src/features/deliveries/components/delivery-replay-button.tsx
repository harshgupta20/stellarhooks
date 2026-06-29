"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError } from "@/lib/api-client";

export function DeliveryReplayButton({ deliveryId }: { deliveryId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onReplay = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/deliveries/${deliveryId}/replay`, { method: "POST" });
      toast.success("Delivery replayed");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not replay delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onReplay}
      disabled={loading}
      aria-label="Replay delivery"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
      Replay
    </Button>
  );
}
