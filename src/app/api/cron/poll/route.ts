import { type NextRequest } from "next/server";

import { assertCronAuthorized } from "@/server/http/cron-auth";
import { pollAllWallets } from "@/server/services/poll-service";
import { ok, handleApiError } from "@/server/http/api-response";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: NextRequest) {
  try {
    assertCronAuthorized(req);
    const summary = await pollAllWallets();
    return ok(summary);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = handle;
export const POST = handle;
