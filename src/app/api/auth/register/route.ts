import { type NextRequest } from "next/server";

import { registerSchema } from "@/features/auth/schemas";
import { registerUser } from "@/server/services/auth-service";
import { created, handleApiError } from "@/server/http/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = registerSchema.parse(body);
    const user = await registerUser(input);
    return created(user);
  } catch (error) {
    return handleApiError(error);
  }
}
