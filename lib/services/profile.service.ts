import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

const AVATAR_BUCKET = "avatars";
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  // Profile row missing (e.g., user created before the trigger existed).
  // Seed it from auth metadata without overwriting anything.
  const fallbackName =
    user.user_metadata?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    null;

  const { error: seedError } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, full_name: fallbackName },
      { onConflict: "id", ignoreDuplicates: true }
    );

  if (seedError) throw seedError;

  const { data: seeded, error: reselectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (reselectError) throw reselectError;
  return seeded;
}

export async function updateProfile(fullName: string): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id)
    .select()
    .maybeSingle();

  let profile = updated;

  if (!profile) {
    if (updateError) throw updateError;
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: user.id, full_name: fullName })
      .select()
      .single();

    if (insertError) throw insertError;
    profile = inserted;
  }

  // Keep auth metadata in sync so client-only UI (sidebar fallback)
  // shows the new name before profiles are refetched.
  const { error: metaError } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  if (metaError) throw metaError;

  return profile;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) throw new Error("Not authenticated");

  // Verify the current password by re-authenticating the session.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) throw new Error("Kata sandi lama tidak sesuai");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error("Gagal memperbarui kata sandi. Silakan coba lagi.");
}

export async function uploadAvatar(file: File): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  if (!AVATAR_MIME_TYPES.includes(file.type)) {
    throw new Error("Format foto harus JPG, PNG, atau WebP");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("Ukuran foto maksimal 2 MB");
  }

  const extension =
    file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const objectPath = `${user.id}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw new Error("Gagal mengunggah foto. Silakan coba lagi.");

  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(objectPath);

  // Read the previous avatar before overwriting it.
  const { data: current, error: selectError } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) throw selectError;
  const previousUrl: string | null = current?.avatar_url ?? null;

  const { data: profile, error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: data.publicUrl })
    .eq("id", user.id)
    .select()
    .single();

  if (updateError) {
    // Rollback the orphan upload so storage stays clean.
    await supabase.storage.from(AVATAR_BUCKET).remove([objectPath]);
    throw updateError;
  }

  // Best-effort cleanup of the replaced avatar object.
  if (previousUrl) {
    const previousPath = extractPublicObjectPath(previousUrl);
    if (
      previousPath &&
      previousPath.bucket === AVATAR_BUCKET &&
      previousPath.path.startsWith(`${user.id}/`)
    ) {
      await supabase.storage.from(AVATAR_BUCKET).remove([previousPath.path]);
    }
  }

  return profile;
}

/** Extracts bucket + object path from a public storage URL. */
function extractPublicObjectPath(
  url: string
): { bucket: string; path: string } | null {
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/";
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;

    const tail = decodeURIComponent(parsed.pathname.slice(index + marker.length));
    const [scope, bucket, ...segments] = tail.split("/");

    if (scope !== "public" || !bucket || segments.length === 0) return null;
    return { bucket, path: segments.join("/") };
  } catch {
    return null;
  }
}
