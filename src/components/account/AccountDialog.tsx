"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { updateUserName, updateUserNotificationPreferences, uploadUserProfilePicture } from "@/action/user";
import { SubmitButton } from "@/components/auth/AuthButtons";
import { PasswordCriteria } from "@/components/auth/PasswordCriteria";
import { TextField } from "@/components/auth/TextField";
import { Button } from "@/components/ds/Button";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { Switch } from "@/components/ds/Switch";
import { CameraFillIcon, User4FillIcon } from "@/components/icons/mingcute";
import { compressImage } from "@/lib/compressImage";
import getCroppedImg from "@/lib/GetCroppedImage";
import { passwordSchema } from "@/lib/validation/auth";
import { changePassword } from "@/server/actions/auth";

type SessionUser = {
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  newRead?: boolean | null;
  newWatch?: boolean | null;
  newsletter?: boolean | null;
  accountActivity?: boolean | null;
};

// Section title row: Bold 16 #333 (uppercase) and a Bold 14 #163300 text action on the right.
function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h3 className="type-body-lg font-bold text-ink uppercase">{title}</h3>
      {action}
    </div>
  );
}

const textAction = "cursor-pointer type-body font-bold text-primary-base underline-offset-4 hover:underline";

// Figma "Account" (153:17034, mobile 156:55666): 650px modal. Photo (100px) with "Upload photo";
// PROFILE (read-only names and email, "Edit profile"); SECURITY (change password, "Reset password");
// Notifications (four switches). Dividers between sections, 25px apart.
export function AccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const [editing, setEditing] = useState(false);
  if (!user) return null;

  return (
    <>
      <Modal open={open && !editing} onOpenChange={onOpenChange} size="lg" title="Compte">
        <div className="flex flex-col items-center gap-[2.5rem] lg:flex-row lg:items-start lg:gap-[5rem]">
          <ProfilePhoto user={user} />
          <div className="flex w-full min-w-0 flex-1 flex-col gap-[2.5rem]">
            <section className="flex flex-col gap-8">
              <SectionTitle
                title="Profil"
                action={
                  <button type="button" className={textAction} onClick={() => setEditing(true)}>
                    Modifier le profil
                  </button>
                }
              />
              <dl className="flex flex-col gap-[1.5rem] type-body">
                {[
                  ["Prénom", user.firstName],
                  ["Nom", user.lastName],
                  ["Adresse email", user.email],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-[0.5rem]">
                    <dt className="text-faint">{label}</dt>
                    <dd className="font-medium break-all text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <hr className="border-divider" />
            <SecuritySection email={user.email} />
            <hr className="border-divider" />
            <NotificationsSection user={user} />
          </div>
        </div>
      </Modal>
      <EditProfileDialog user={user} open={open && editing} onOpenChange={setEditing} />
    </>
  );
}

// 100px avatar (user icon when none) and "Upload photo": pick, crop to a square, compress, upload.
function ProfilePhoto({ user }: { user: SessionUser }) {
  const { update } = useSession();
  const pathname = usePathname();
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Choisissez une image.");
    if (file.size > 15 * 1024 * 1024) return void toast.error("L'image ne doit pas dépasser 15 Mo.");
    setSource(URL.createObjectURL(file));
  }

  function save() {
    if (!source || !area) return;
    startTransition(async () => {
      const blob = await getCroppedImg(source, area);
      const body = new FormData();
      body.append("image", await compressImage(new File([blob], "profile.jpg", { type: blob.type || "image/jpeg" })));
      const result = await uploadUserProfilePicture(body, pathname);
      if (!result.success) return void toast.error(result.error);
      await update();
      URL.revokeObjectURL(source);
      setSource(null);
      toast.success("Photo mise à jour");
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-4">
      <label className="group relative flex size-[10rem] cursor-pointer items-center justify-center overflow-hidden rounded-full text-ink">
        {user.profileImageUrl ? (
          <Image src={user.profileImageUrl} alt="" fill sizes="100px" className="object-cover" />
        ) : (
          <User4FillIcon size={100} />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <CameraFillIcon size={28} />
        </span>
        <input type="file" accept="image/*" className="sr-only" onChange={pick} />
      </label>
      <label className={textAction}>
        {user.profileImageUrl ? "Changer la photo" : "Ajouter une photo"}
        <input type="file" accept="image/*" className="sr-only" onChange={pick} />
      </label>
      <Modal open={Boolean(source)} onOpenChange={(next) => !next && setSource(null)} title="Recadrer la photo">
        <div className="relative h-[30rem] overflow-hidden rounded-card bg-black">
          {source && (
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          )}
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-label="Zoom"
          className="relative w-full accent-primary-base"
        />
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" className="w-full" onClick={save} disabled={pending}>
              {pending ? "Envoi…" : "Enregistrer la photo"}
            </Button>
          </div>
        </ModalActions>
      </Modal>
    </div>
  );
}

const passwordForm = z.object({ password: z.string().min(1, "Mot de passe actuel requis").max(128), newPassword: passwordSchema });
type PasswordValues = z.input<typeof passwordForm>;

// Change password (old + new, criteria chips). Changing it signs every other device out (session
// fingerprint); this one signs straight back in with the new password.
function SecuritySection({ email }: { email: string }) {
  const [focused, setFocused] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordForm), mode: "onChange", defaultValues: { password: "", newPassword: "" } });
  const newPassword = useWatch({ control, name: "newPassword" }) ?? "";
  const field = register("newPassword");

  async function onSubmit(values: PasswordValues) {
    const result = await changePassword(values);
    if (result.success !== true) return setError("password", { message: result.message });
    const again = await signIn("credentials", { email, password: values.newPassword, redirect: false });
    if (again?.error) return void signOut({ redirectTo: "/auth/login" });
    reset();
    toast.success("Mot de passe modifié. Vos autres appareils ont été déconnectés.");
  }

  return (
    <section className="flex flex-col gap-8">
      <SectionTitle
        title="Sécurité"
        action={
          <Link href="/auth/forgot-password" className={textAction}>
            Mot de passe oublié ?
          </Link>
        }
      />
      <p className="type-body font-medium text-ink">Changer le mot de passe</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-[1.5rem]">
        {/* For password managers: which account this is. */}
        <input type="email" autoComplete="username" value={email} readOnly hidden />
        <TextField label="Mot de passe actuel" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        <div className="flex flex-col gap-4">
          <TextField
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            {...field}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              setFocused(false);
              void field.onBlur(e);
            }}
          />
          <PasswordCriteria value={newPassword} visible={focused || newPassword.length > 0} />
        </div>
        <div className="self-start">
          <SubmitButton disabled={!isValid} pending={isSubmitting}>
            Changer le mot de passe
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}

// Figma labels; "Le meilleur de la semaine" is stored in newWatch (decided with the owner).
const PREFERENCES = [
  { key: "newRead", label: "Nouveaux articles" },
  { key: "newWatch", label: "Le meilleur de la semaine" },
  { key: "newsletter", label: "Newsletter" },
  { key: "accountActivity", label: "Activité du compte" },
] as const;
type PreferenceKey = (typeof PREFERENCES)[number]["key"];

function NotificationsSection({ user }: { user: SessionUser }) {
  const { update } = useSession();
  const pathname = usePathname();
  const [values, setValues] = useState<Record<PreferenceKey, boolean>>({
    newRead: Boolean(user.newRead),
    newWatch: Boolean(user.newWatch),
    newsletter: Boolean(user.newsletter),
    accountActivity: Boolean(user.accountActivity),
  });
  const [pending, startTransition] = useTransition();

  function toggle(key: PreferenceKey, checked: boolean) {
    const previous = values;
    const next = { ...values, [key]: checked };
    setValues(next);
    startTransition(async () => {
      const result = await updateUserNotificationPreferences(next, pathname);
      if (!result.success) {
        setValues(previous);
        return void toast.error(result.error);
      }
      await update();
    });
  }

  return (
    <section className="flex flex-col gap-8">
      <SectionTitle title="Notifications" />
      <ul className="flex flex-col gap-4">
        {PREFERENCES.map(({ key, label }) => (
          <li key={key} className="flex items-center justify-between gap-4 py-[0.5rem] type-body font-medium text-ink">
            {label}
            <Switch checked={values[key]} onChange={(checked) => toggle(key, checked)} label={label} disabled={pending} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const nameForm = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(100),
  lastName: z.string().trim().min(1, "Nom requis").max(100),
});
type NameValues = z.input<typeof nameForm>;

// Figma "Edit profile" (153:17303 / 153:17530, mobile 156:56221): first and last name side by side,
// "Go back" and "Save changes" (enabled once something changed).
function EditProfileDialog({ user, open, onOpenChange }: { user: SessionUser; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { update } = useSession();
  const pathname = usePathname();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm<NameValues>({
    resolver: zodResolver(nameForm),
    mode: "onChange",
    values: { firstName: user.firstName, lastName: user.lastName },
  });

  async function onSubmit(values: NameValues) {
    const result = await updateUserName(values, pathname);
    if (!result.success) return void toast.error(result.error);
    await update();
    toast.success("Profil mis à jour");
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Modifier le profil">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative flex flex-col gap-[2.5rem]">
        <div className="flex gap-4">
          <TextField label="Prénom" autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
          <TextField label="Nom" autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
        </div>
        <ModalActions>
          <ModalBackButton />
          <div className="lg:w-[32rem]">
            <SubmitButton disabled={!isValid || !isDirty} pending={isSubmitting}>
              Enregistrer
            </SubmitButton>
          </div>
        </ModalActions>
      </form>
    </Modal>
  );
}
