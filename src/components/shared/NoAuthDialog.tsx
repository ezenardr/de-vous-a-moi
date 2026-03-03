"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input, PasswordInput } from "./Inputs";
import Link from "next/link";
import { ButtonPrimary } from "./Buttons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import LoadingCircleSmall from "../loaders/LoadingCircleSmall";
import { useRef } from "react";

const LoginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string(),
});
type TLoginSchema = z.infer<typeof LoginSchema>;

export default function NoAuthDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TLoginSchema>({
    resolver: zodResolver(LoginSchema),
  });
  const closeRef = useRef<HTMLButtonElement>(null);
  const onSubmit = async () => {
    const email = getValues("email");
    const password = getValues("password");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL,
    });
    if (result?.error) {
      toast.error("Email ou mot de passe incorrect");
    } else {
      closeRef.current?.click();
    }
  };
  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer">{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[520px] overflow-y-scroll">
        <DialogTitle className="sr-only">Newletter</DialogTitle>
        <div className="overflow-x-hidden">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 font-secondary text-center">
              <h1 className="text-[3.2rem] font-bold font-primary leading-[120%] tracking-[-0.96px]">
                Connectez-vous
              </h1>
              <p className="text-[1.6rem] font-secondary font-normal leading-[145%] tracking-[-0.48px] text-[#A3A3A3]">
                Reprenez là où vous vous étiez arrêté — vos lectures
                sauvegardées, vos réflexions, votre espace.
              </p>
            </div>
            <form>
              <div className="flex flex-col gap-6 font-secondary tracking-[-0.42px]">
                <Input {...register("email")} error={errors.email?.message}>
                  Adresse mail
                </Input>

                <PasswordInput
                  {...register("password")}
                  error={errors.password?.message}
                >
                  Mot de passe
                </PasswordInput>
              </div>
              <p className="font-bold text-[1.4rem] text-right leading-[145%] pt-4 text-primary-base">
                <Link
                  href={
                    "/auth/forgot-password?entity=Mot de passe oublié&currentStep=1&totalStep=3"
                  }
                  className="hover:underline"
                >
                  Mot de passe oublié?
                </Link>
              </p>
              <ButtonPrimary
                className="mt-10 w-full"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(onSubmit)()}
              >
                {isSubmitting ? <LoadingCircleSmall /> : "Se connecter"}
              </ButtonPrimary>
            </form>
          </div>

          {/* <div className="flex flex-col gap-12 mt-12 mb-6 text-center leading-[145%] tracking-[-0.48px]">
            <p className="font-primary text-[1.6rem] text-neutral-500">or</p>
            <button className="w-full bg-black rounded-xl text-[1.6rem] font-medium text-white px-[2.4rem] py-[1.6rem] flex items-center justify-center gap-4">
              <Image src={Google} alt="Google icon" />
              Continuer avec Google
            </button>
          </div> */}

          <div className="flex flex-col lg:flex-row mt-6 items-center gap-[5px] justify-center font-secondary leading-[145%]">
            <p className="text-[1.6rem] font-medium tracking-[-0.48px] text-[#A3A3A3]">
              Vous n&apos;avez pas de compte?
            </p>
            <Link
              href={
                "/auth/register?entity=Inscription&currentStep=1&totalStep=2"
              }
              className="text-[1.4rem] hover:underline font-bold tracking-[-0.42px] text-primary-base flex items-center"
            >
              Créer un compte
            </Link>
          </div>
        </div>
        <DialogClose ref={closeRef} />
      </DialogContent>
    </Dialog>
  );
}
