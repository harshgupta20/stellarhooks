"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { EVENT_TYPES } from "@/lib/constants";
import { createWebhookSchema, type CreateWebhookInput } from "@/features/webhooks/schemas";
import { type WebhookWithSecretDTO } from "@/features/webhooks/types";
import { EventsField } from "@/features/webhooks/components/events-field";
import { SecretRevealDialog } from "@/features/webhooks/components/secret-reveal-dialog";

export function WebhookCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const form = useForm<CreateWebhookInput>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues: { name: "", url: "", events: [...EVENT_TYPES] },
  });

  const onSubmit = async (values: CreateWebhookInput) => {
    setSubmitting(true);
    try {
      const webhook = await apiFetch<WebhookWithSecretDTO>("/api/webhooks", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Webhook created");
      setOpen(false);
      form.reset({ name: "", url: "", events: [...EVENT_TYPES] });
      setRevealedSecret(webhook.secret);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not create webhook");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="size-4" />
            Add webhook
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add webhook</DialogTitle>
            <DialogDescription>We&apos;ll POST signed events to this endpoint.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Production endpoint" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://api.example.com/webhooks/stellar"
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Must be reachable over HTTP(S).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="events"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Events</FormLabel>
                    <FormControl>
                      <EventsField value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Create webhook
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <SecretRevealDialog
        secret={revealedSecret}
        open={revealedSecret !== null}
        onOpenChange={(o) => {
          if (!o) setRevealedSecret(null);
        }}
      />
    </>
  );
}
