"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import {
  profileSchema,
  type ProfileInput,
} from "@/lib/validations/profile.schema";
import { uploadAvatarAction, updateProfileAction } from "@/app/api/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Notifies mounted sidebars to refetch profile data. */
function notifyProfileUpdated() {
  window.dispatchEvent(new Event("profile:updated"));
}

interface ProfileFormProps {
  fullName: string;
  avatarUrl: string | null;
}

export function ProfileForm({ fullName, avatarUrl }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: fullName },
  });

  async function onAvatarChange(file: File | undefined) {
    if (!file) return;

    if (!AVATAR_MIME_TYPES.includes(file.type)) {
      toast.error("Format foto harus JPG, PNG, atau WebP");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error("Ukuran foto maksimal 2 MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadAvatarAction(formData);
      setAvatar(result.avatar_url);
      toast.success("Foto profil berhasil diperbarui");
      notifyProfileUpdated();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengunggah foto. Silakan coba lagi."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onSubmit(data: ProfileInput) {
    try {
      await updateProfileAction(data.full_name);
      toast.success("Profil berhasil diperbarui");
      notifyProfileUpdated();
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto & Nama</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Ubah foto profil"
              className="group relative size-24 overflow-hidden rounded-full ring-1 ring-border transition-opacity focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Foto profil"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-primary/15 text-2xl font-semibold text-primary">
                  {(fullName?.[0] ?? "?").toUpperCase()}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Camera className="size-5 text-white" />
              </span>
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
                  Mengunggah…
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_MIME_TYPES.join(",")}
              className="hidden"
              onChange={(event) => onAvatarChange(event.target.files?.[0])}
            />
            <p className="text-[11px] text-muted-foreground">
              JPG, PNG, atau WebP · maksimal 2 MB
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex-1 space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                placeholder="Nama Anda"
                {...register("full_name")}
                aria-invalid={!!errors.full_name}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
