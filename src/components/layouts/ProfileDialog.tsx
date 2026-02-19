"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import User4Fill from "@/assets/icons/User4Fill.svg";
import { useCallback, useRef, useState } from "react";
import { User } from "@/types/types";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input, PasswordInput } from "../shared/Inputs";
import { ButtonPrimary } from "../shared/Buttons";
import ToggleIcon from "../shared/ToggleIcon";
import { motion } from "framer-motion";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Criteria } from "@/app/auth/register/Criteria";
import Info from "@/assets/icons/Info.svg";
import { MessageCircleWarning } from "lucide-react";
import Link from "next/link";
import {
  updateUserName,
  updateUserNotificationPreferences,
  uploadUserProfilePicture,
} from "@/action/user";
import { usePathname } from "next/navigation";
import LoadingDots from "../loaders/LoadingDots";
import getCroppedImg from "@/lib/GetCroppedImage";
import Cropper from "react-easy-crop";
import LoadingCircleSmall from "../loaders/LoadingCircleSmall";

export default function ProfileDialog() {
  const { data: session } = useSession();
  const user = session?.user;
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer flex items-center gap-4 w-full">
        <Image src={User4Fill} alt="User 4 Fill" width={16} height={18} />
        Profile
      </DialogTrigger>
      <DialogContent className="max-h-[90vh]  overflow-hidden flex flex-col">
        {currentStep === 0 && (
          <>
            <DialogTitle>Compte</DialogTitle>
            <div className="flex gap-20 w-full min-h-0 flex-1">
              <UploadProfilePictureComponent user={user as User} />
              <div className="w-full flex flex-col gap-10 overflow-y-auto min-h-0">
                <ProfileComponent
                  user={user as User}
                  setCurrentStep={setCurrentStep}
                  setPreviousStep={setPreviousStep}
                />
                <div className="h-px w-full bg-[#E8E8E8]"></div>
                <SecurityComponent />
                <div className="h-px w-full bg-[#E8E8E8]"></div>
                <NotificationComponent user={user as User} />
              </div>
            </div>
          </>
        )}
        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            layout={false}
            className="max-h-[90vh] h-full overflow-hidden flex flex-col gap-10"
          >
            <DialogTitle>Modifier votre profil</DialogTitle>
            <EditProfileComponent
              user={user as User}
              setCurrentStep={setCurrentStep}
              setPreviousStep={setPreviousStep}
            />
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ProfileComponent({
  user,
  setCurrentStep,
  setPreviousStep,
}: {
  user: User;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setPreviousStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <form className="flex flex-col gap-[15px]">
      <div className="flex items-start justify-between font-bold text-[1.6rem] text-[#333333] pb-[5px]">
        <span className="uppercase">Profil</span>
        <button
          onClick={() => {
            setCurrentStep(1);
            setPreviousStep(0);
          }}
          className="text-[1.4rem] cursor-pointer text-primary-base"
        >
          Modifier votre profil
        </button>
      </div>
      <div className="flex flex-col gap-[5px]">
        <span className="text-[1.4rem] text-[#A3A3A3] tracking-wide">
          Prénom
        </span>
        <span className="text-[1.4rem] text-[#333333] tracking-wide">
          {user.firstName}
        </span>
      </div>
      <div className="flex flex-col gap-[5px]">
        <span className="text-[1.4rem] text-[#A3A3A3] tracking-wide">Nom</span>
        <span className="text-[1.4rem] text-[#333333] tracking-wide">
          {user.lastName}
        </span>
      </div>
      <div className="flex flex-col gap-[5px]">
        <span className="text-[1.4rem] text-[#A3A3A3] tracking-wide">
          Adresse email
        </span>
        <span className="text-[1.4rem] text-[#333333] tracking-wide">
          {user.email}
        </span>
      </div>
    </form>
  );
}

export function UploadProfilePictureComponent({ user }: { user: User }) {
  const [isLoading, setIsloading] = useState(false);
  const { data: session, update } = useSession();
  const pathname = usePathname();
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.profileImageUrl ?? null,
  );
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback(
    (_: unknown, croppedPixels: any) => setCroppedAreaPixels(croppedPixels),
    [],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    triggerRef.current?.click();
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImageSrc(reader.result as string);
  };

  async function cropImage() {
    setIsloading(true);
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const file = new File([croppedBlob], "profile.jpg", {
      type: croppedBlob.type,
    });

    //upload image
    const formData = new FormData();
    formData.append("image", file);
    const result = await uploadUserProfilePicture(
      formData,
      user.accessToken,
      pathname,
    );
    if (result.success === true) {
      await update({
        ...session,
        user: {
          ...session?.user,
          profileImageUrl: result.profileImageUrl,
          imageFileId: result.imageFileId,
        },
      });
    }
    // setValue("image", file, { shouldValidate: true });
    setImagePreview(URL.createObjectURL(file));
    setIsloading(false);
  }
  return (
    <div className="flex flex-col items-center gap-3 relative">
      {isLoading && (
        <div className="absolute z-50 top-15">
          <LoadingCircleSmall />
        </div>
      )}
      {imagePreview ? (
        <div className="w-40 flex flex-col gap-4 shrink-0 relative">
          <Image
            src={imagePreview}
            alt="Preview"
            width={100}
            height={100}
            className="h-full w-full object-cover rounded-full"
          />
          <span className="font-bold text-[1.4rem] font-secondary text-center">
            Modifier la photo
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute top-0 left-0 w-full h-full z-50 opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <div className="w-40 flex flex-col gap-4 shrink-0 relative">
          <Image src={User4Fill} alt="User 4 Fill" width={100} height={100} />
          <span className="font-bold text-[1.4rem] font-secondary text-center">
            Ajouter une photo
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute top-0 left-0 w-full h-full z-50 opacity-0 cursor-pointer"
          />
        </div>
      )}
      <Dialog>
        <DialogTrigger asChild className="hidden">
          <span ref={triggerRef} className="hidden">
            open
          </span>
        </DialogTrigger>
        <DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Redimenssioner l&apos;image</DialogTitle>
            <DialogDescription className="sr-only">
              This action cannot be undone
            </DialogDescription>
            {imageSrc && (
              <div className="relative w-full h-[300px]">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild onClick={cropImage}>
              <span className="bg-primary-500 px-12 py-[15px] border-2 border-transparent rounded-[100px] text-white font-medium text-[1.5rem] h-auto leading-8 cursor-pointer flex items-center justify-center w-full">
                Redimenssioner l&apos;image
              </span>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const EditProfileSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
});
type TEditProfileSchema = z.infer<typeof EditProfileSchema>;

export function EditProfileComponent({
  user,
  setCurrentStep,
  setPreviousStep,
}: {
  user: User;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setPreviousStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TEditProfileSchema>({
    resolver: zodResolver(EditProfileSchema),
  });
  const { data: session, update } = useSession();
  const pathname = usePathname();
  async function submitHandler(data: TEditProfileSchema) {
    const result = await updateUserName(data, user.accessToken, pathname);
    if (result.success === true) {
      await update({
        ...session,
        user: {
          ...session?.user,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
      setCurrentStep(0);
      setPreviousStep(1);
    } else {
      toast.error(result.error);
    }
  }
  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="flex flex-col gap-10"
    >
      <div className="flex flex-col w-full lg:items-center gap-4">
        <Input
          {...register("firstName")}
          error={errors.firstName?.message}
          defaultValue={user.firstName}
          className="flex-1"
        >
          Prénom
        </Input>
        <Input
          {...register("lastName")}
          error={errors.lastName?.message}
          defaultValue={user.lastName}
          className="flex-1"
        >
          Nom de famille
        </Input>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-8">
        <ButtonPrimary
          onClick={() => {
            setCurrentStep(0);
            setPreviousStep(1);
          }}
          className="bg-[#F8F8F8] order-2 lg:order-1"
        >
          Retour
        </ButtonPrimary>
        <ButtonPrimary
          type="submit"
          disabled={isSubmitting}
          className="flex-1 col-span-2 order-1 lg:order-2"
        >
          {isSubmitting ? <LoadingDots /> : "Sauvegarder"}
        </ButtonPrimary>
      </div>
    </form>
  );
}

const ChangePasswordSchema = z.object({
  password: z.string().min(1, "Ce champ ne peut pas être vide"),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caratères")
    .regex(
      /[A-Z]/,
      "Le mot de passe doit contenir au moins une lettre majuscule",
    )
    .regex(
      /[a-z]/,
      "Le mot de passe doit contenir au moins une lettre miniscule",
    )
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(
      /[^A-Za-z0-9]/,
      "Le mot de passe doit contenir au moins un caractère spécial",
    ),
});
type TChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;
const criteriaList = [
  { regex: /.{8,}/, label: "Au moins 8 caractères" },
  { regex: /[A-Z]/, label: "Lettre majuscule" },
  { regex: /[a-z]/, label: "Lettre minuscule" },
  { regex: /[0-9]/, label: "Chiffre" },
  { regex: /[^A-Za-z0-9]/, label: "Caractère spécial" },
];

export function SecurityComponent() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TChangePasswordSchema>({
    resolver: zodResolver(ChangePasswordSchema),
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch("newPassword");
  const { data: session } = useSession();
  async function submitHandler(data: TChangePasswordSchema) {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.accessToken}`,
          origin: process.env.NEXT_PUBLIC_APP_URL!,
          "Accept-Language": "fr",
        },
        body: JSON.stringify(data),
      },
    );
    const response = await request.json();
    if (response.success === true) {
      toast.success("Vous avez change votre mot de passe avec succès");
      signOut({
        redirect: true,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
      });
    } else {
      toast.error(response.message);
    }
  }
  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="flex flex-col gap-[15px]"
    >
      <div className="flex items-start justify-between font-bold text-[1.6rem] text-[#333333] pb-[5px]">
        <span className="uppercase">Securité</span>
        <Link
          href={
            "/auth/forgot-password?entity=Mot de passe oublié&currentStep=1&totalStep=3"
          }
          className="text-[1.4rem] text-primary-base"
        >
          Mot de passe oublié
        </Link>
      </div>
      <PasswordInput {...register("password")} error={errors.password?.message}>
        Ancien mot de passe
      </PasswordInput>
      <PasswordInput
        {...register("newPassword")}
        error={errors.newPassword?.message}
      >
        Nouveau mot de passe
      </PasswordInput>
      {password && (
        <div className="mt-[.8rem] flex flex-col gap-2.5">
          <div className="flex gap-[.4rem] font-secondary text-[12px] text-[#333333] tracking-[-0.36px] items-center">
            <Image src={Info} alt="Infoicon" />
            <p>Votre mot de passe doit répondre aux critères suivants :</p>
          </div>
          <div className="flex flex-wrap gap-[.8rem]">
            {criteriaList.map(({ regex, label }) => (
              <Criteria key={label} isValid={regex.test(password)}>
                {label}
              </Criteria>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-start gap-4 border p-4 rounded-[5px] border-neutral-300">
        <MessageCircleWarning size="24" color="#737C8A" />
        <div>
          <span className="text-[1.2rem] leading-8 text-neutral-900">
            Conseil de sécurité
          </span>
          <p className="text-[1.2rem] leading-8 text-neutral-800">
            Après avoir mis à jour votre mot de passe, vous devrez vous
            reconnecter sur tous vos appareils pour des raisons de sécurité.
          </p>
        </div>
      </div>
      <ButtonPrimary type="submit" disabled={isSubmitting}>
        {isSubmitting ? <LoadingDots /> : "Changer votre mot de passe"}
      </ButtonPrimary>
    </form>
  );
}

export function NotificationComponent({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const { data: session, update } = useSession();
  async function changeHandler(e: React.FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const newRead = formData.get("newRead") === "on";
    const newWatch = formData.get("newWatch") === "on";
    const newsletter = formData.get("newsletter") === "on";
    const accountActivity = formData.get("accountActivity") === "on";

    const body = {
      newRead,
      newWatch,
      newsletter,
      accountActivity,
    };
    const result = await updateUserNotificationPreferences(
      body,
      user.accessToken,
      pathname,
    );

    if (result.success === true) {
      await update({
        ...session,
        user: {
          ...session?.user,
          newRead,
          newWatch,
          newsletter,
          accountActivity,
        },
      });
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }
  return (
    <form
      onChange={changeHandler}
      className="flex flex-col gap-[15px] relative"
    >
      <div className="flex items-start justify-between font-bold text-[1.6rem] text-[#333333] pb-[5px]">
        <span className="uppercase">Notifications</span>
      </div>
      <div className="flex flex-col gap-8 w-full">
        <div className={"flex items-center justify-between"}>
          <p
            className={
              "text-[1.6rem] leading-[2.2rem] text-deep-100 max-w-md lg:max-w-152"
            }
          >
            Nouvel article
          </p>
          <label
            className={`relative inline-block h-12 w-20 rounded-full bg-[#E8E8E8] transition [-webkit-tap-highlight-color:transparent] peer-disabled:cursor-not-allowed has-checked:bg-primary-base cursor-pointer`}
          >
            <input
              className="peer sr-only disabled:cursor-not-allowed"
              id="newRead"
              defaultChecked={user.newRead}
              name={"newRead"}
              type="checkbox"
              disabled={isLoading}
            />
            <ToggleIcon />
          </label>
        </div>
        <div className={"flex items-center justify-between"}>
          <p
            className={
              "text-[1.6rem] leading-[2.2rem] text-deep-100 max-w-md lg:max-w-152"
            }
          >
            Nouvelle vidéo
          </p>
          <label
            className={`relative inline-block h-12 w-20 rounded-full bg-[#E8E8E8] transition [-webkit-tap-highlight-color:transparent] has-checked:bg-primary-base cursor-pointer`}
          >
            <input
              className="peer sr-only"
              id="newWatch"
              defaultChecked={user.newWatch}
              name={"newWatch"}
              type="checkbox"
              disabled={isLoading}
            />
            <ToggleIcon />
          </label>
        </div>
        <div className={"flex items-center justify-between"}>
          <p
            className={
              "text-[1.6rem] leading-[2.2rem] text-deep-100 max-w-md lg:max-w-152"
            }
          >
            Newsletter
          </p>
          <label
            className={`relative inline-block h-12 w-20 rounded-full bg-[#E8E8E8] transition [-webkit-tap-highlight-color:transparent] has-checked:bg-primary-base cursor-pointer`}
          >
            <input
              className="peer sr-only"
              id="newsletter"
              defaultChecked={user.newsletter}
              name={"newsletter"}
              type="checkbox"
              disabled={isLoading}
            />
            <ToggleIcon />
          </label>
        </div>
        <div className={"flex items-center justify-between"}>
          <p
            className={
              "text-[1.6rem] leading-[2.2rem] text-deep-100 max-w-md lg:max-w-152"
            }
          >
            Activité de mon compte
          </p>
          <label
            className={`relative inline-block h-12 w-20 rounded-full bg-[#E8E8E8] transition [-webkit-tap-highlight-color:transparent] has-checked:bg-primary-base cursor-pointer`}
          >
            <input
              className="peer sr-only"
              id="accountActivity"
              defaultChecked={user.accountActivity}
              name={"accountActivity"}
              type="checkbox"
              disabled={isLoading}
            />
            <ToggleIcon />
          </label>
        </div>
      </div>
      {isLoading && (
        <div className="absolute top-[50%] flex justify-center left-[50%] -translate-y-[50%] -translate-x-[50%] w-full z-50">
          <LoadingDots />
        </div>
      )}
    </form>
  );
}
