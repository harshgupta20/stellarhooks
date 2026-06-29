import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { sendPayment } from "@/server/services/cloud-wallet-service";
import { sendPaymentSchema } from "@/features/cloud-wallets/schemas";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const input = sendPaymentSchema.parse(await req.json());
    return ok(await sendPayment(user.id, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
