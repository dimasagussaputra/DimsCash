import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path) {
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

loadEnv(new URL("../.env.local", import.meta.url));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local");
  process.exit(1);
}

const translations = {
  "Food & Beverage": "Makanan & Minuman",
  Transportation: "Transportasi",
  Shopping: "Belanja",
  Education: "Pendidikan",
  Health: "Kesehatan",
  Entertainment: "Hiburan",
  Bills: "Tagihan",
  Other: "Lainnya",
  Salary: "Gaji",
  Freelance: "Freelance",
  Business: "Usaha",
  Investment: "Investasi",
  Gift: "Hadiah",
};

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let updated = 0;

for (const [from, to] of Object.entries(translations)) {
  const { error } = await supabase
    .from("categories")
    .update({ name: to })
    .eq("is_default", true)
    .eq("name", from);

  if (error) {
    console.error(`gagal menerjemahkan "${from}":`, error.message);
    process.exit(1);
  }
  updated += 1;
}

console.log(`selesai: ${updated} aturan penerjemahan diterapkan`);
