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
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local\n" +
      "Ambil service_role key di: Dashboard Supabase -> Project Settings -> API Keys"
  );
  process.exit(1);
}

const users = [
  { email: "admin@gmail.com", password: "admin123", full_name: "Admin" },
];

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let failed = false;

for (const u of users) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { full_name: u.full_name },
  });

  if (error) {
    if (error.code === "email_exists") {
      console.log(`skip (sudah ada): ${u.email}`);
    } else {
      console.error(`gagal membuat ${u.email}:`, error.message);
      failed = true;
    }
  } else {
    console.log(`dibuat: ${data.user.email} (${data.user.id})`);
  }
}

process.exit(failed ? 1 : 0);
