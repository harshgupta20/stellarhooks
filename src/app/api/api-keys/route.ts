import { type NextRequest } from "next/server";
import { z } from "zod";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listApiKeys, createApiKey } from "@/server/services/apikey-service";
import { ok, created, handleApiError } from "@/server/http/api-response";

const createSchema = z.object({ name: z.string().trim().min(1, "Name is required").max(60) });

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listApiKeys(user.id, await getModeNetwork()));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { name } = createSchema.parse(await req.json());
    return created(await createApiKey(user.id, name, await getModeNetwork()));
  } catch (error) {
    return handleApiError(error);
  }
}
