"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import {
  PLANS,
  PLAN_LABELS,
  PLAN_RESOURCES,
  RESOURCE_LABELS,
  type PlanTier,
  type PlanLimitResource,
} from "@/lib/constants";

type Matrix = Record<PlanTier, Record<PlanLimitResource, number>>;

export function PlanLimitsEditor({ initial }: { initial: Matrix }) {
  const router = useRouter();
  const [limits, setLimits] = useState<Matrix>(initial);
  const [saving, setSaving] = useState(false);

  const setValue = (plan: PlanTier, resource: PlanLimitResource, raw: string) => {
    const n = raw === "" || raw === "-" ? 0 : Math.trunc(Number(raw));
    setLimits((prev) => ({
      ...prev,
      [plan]: { ...prev[plan], [resource]: Number.isFinite(n) ? n : 0 },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/admin/plan-limits", {
        method: "PUT",
        body: JSON.stringify({ limits }),
      });
      toast.success("Plan limits updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="p-3 font-medium">Resource</th>
                {PLANS.map((plan) => (
                  <th key={plan} className="p-3 font-medium">
                    {PLAN_LABELS[plan]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {PLAN_RESOURCES.map((resource) => (
                <tr key={resource}>
                  <td className="p-3 capitalize">{RESOURCE_LABELS[resource]}</td>
                  {PLANS.map((plan) => {
                    const value = limits[plan][resource];
                    return (
                      <td key={plan} className="p-2">
                        <Input
                          type="number"
                          step={1}
                          min={-1}
                          value={value}
                          onChange={(e) => setValue(plan, resource, e.target.value)}
                          className="h-8 w-24"
                          aria-label={`${PLAN_LABELS[plan]} ${resource}`}
                        />
                        {value < 0 && (
                          <span className="ml-1 text-[10px] text-muted-foreground">∞</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Enter <code className="font-mono">-1</code> for unlimited. Changes apply immediately to
            enforcement.
          </p>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save limits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
