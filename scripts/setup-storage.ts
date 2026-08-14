import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import {
  STORAGE_BUCKETS,
  STORAGE_POLICIES,
  type StorageBucket,
} from "../src/shared/constants/storage";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const buckets = Object.values(STORAGE_BUCKETS) as StorageBucket[];

  for (const bucket of buckets) {
    const policy = STORAGE_POLICIES[bucket];

    const { data: existing, error: getError } =
      await supabase.storage.getBucket(bucket);

    if (getError || !existing) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: policy.publico,
      });
      if (error) {
        console.error(`Error al crear "${bucket}": ${error.message}`);
        process.exit(1);
      }
      console.log(`Bucket "${bucket}" creado (público: ${policy.publico}).`);
    } else {
      const { error } = await supabase.storage.updateBucket(bucket, {
        public: policy.publico,
      });
      if (error) {
        console.error(`Error al actualizar "${bucket}": ${error.message}`);
        process.exit(1);
      }
      console.log(
        `Bucket "${bucket}" existente; acceso público actualizado a ${policy.publico}.`,
      );
    }
  }

  console.log(
    "Storage listo. Aplica las políticas RLS con el SQL documentado en docs/storage.md.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
