import { getProfile } from "@/lib/services/profile.service";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { LogoutButton } from "@/components/profile/logout-button";
import { PageHeader } from "@/components/layout/page-header";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Profil"
        description="Kelola informasi dan keamanan akun Anda"
      />
      <ProfileForm
        fullName={profile?.full_name ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <ChangePasswordForm />
      <div className="lg:hidden">
        <LogoutButton />
      </div>
    </div>
  );
}
