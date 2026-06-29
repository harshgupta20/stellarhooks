"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { EVENT_TYPES, type EventType } from "@/lib/constants";

const EVENT_LABELS: Record<EventType, { label: string; description: string }> = {
  "payment.received": {
    label: "payment.received",
    description: "When a monitored wallet receives a payment",
  },
  "payment.completed": {
    label: "payment.completed",
    description: "When a payment for a product is confirmed",
  },
};

export function EventsField({
  value,
  onChange,
}: {
  value: EventType[];
  onChange: (value: EventType[]) => void;
}) {
  const toggle = (event: EventType, checked: boolean) => {
    onChange(checked ? [...new Set([...value, event])] : value.filter((e) => e !== event));
  };

  return (
    <div className="space-y-2">
      {EVENT_TYPES.map((event) => {
        const meta = EVENT_LABELS[event];
        return (
          <label
            key={event}
            className="hover:bg-accent/40 flex cursor-pointer items-start gap-3 rounded-md border p-3"
          >
            <Checkbox
              checked={value.includes(event)}
              onCheckedChange={(c) => toggle(event, c === true)}
              className="mt-0.5"
            />
            <span className="space-y-0.5">
              <span className="block font-mono text-sm">{meta.label}</span>
              <span className="text-muted-foreground block text-xs">{meta.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
