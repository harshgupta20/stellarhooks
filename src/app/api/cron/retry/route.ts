import { type NextRequest } from "next/server";

import { assertCronAuthorized } from "@/server/http/cron-auth";
import { getDueRetryDeliveryIds, attemptDelivery } from "@/server/services/delivery-service";
import { ok, handleApiError } from "@/server/http/api-response";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RETRY_BATCH_SIZE = 100;

async function handle(req: NextRequest) {
  try {
    assertCronAuthorized(req);

    const ids = await getDueRetryDeliveryIds(RETRY_BATCH_SIZE);
    let processed = 0;
    let errors = 0;
    for (const id of ids) {
      try {
        await attemptDelivery(id);
        processed += 1;
      } catch (err) {
        errors += 1;
        console.error(`[retry] delivery ${id} failed:`, err);
      }
    }

    return ok({ retriesProcessed: processed, errors });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = handle;
export const POST = handle;
