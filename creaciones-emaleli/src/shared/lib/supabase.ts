import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/src/shared/lib/errors";

let adminClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new AppError(
      "Supabase no está configurado: revisa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.",
      { statusCode: 500, code: "SUPABASE_NOT_CONFIGURED" },
    );
  }

  if (!adminClient) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}
