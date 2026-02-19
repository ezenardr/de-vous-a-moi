"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input, PasswordInput } from "@/components/shared/Inputs";
import Google from "@/assets/icons/Google.svg";
import Image from "next/image";
import Link from "next/link";
import { ButtonPrimary } from "@/components/shared/Buttons";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import LoadingCircleSmall from "@/components/loaders/LoadingCircleSmall";

const LoginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string(),
});
type TLoginSchema = z.infer<typeof LoginSchema>;

export default function LoginContent() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TLoginSchema>({
    resolver: zodResolver(LoginSchema),
  });
  const router = useRouter();
  const onSubmit = async (data: TLoginSchema) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL,
    });
    if (result?.error) {
      toast.error("Email ou mot de passe incorrect");
    } else {
      router.push("/");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-[15px] font-secondary text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[32px] font-bold font-primary leading-[120%] tracking-[-0.96px]"
          >
            Bon Retour
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[16px] font-secondary font-normal leading-[145%] tracking-[-0.48px] text-[#A3A3A3]"
          >
            Reprenez là où vous vous étiez arrêté — vos lectures sauvegardées,
            vos réflexions, votre espace.
          </motion.p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6 font-secondary tracking-[-0.42px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Input {...register("email")} error={errors.email?.message}>
                Adresse mail
              </Input>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <PasswordInput
                {...register("password")}
                error={errors.password?.message}
              >
                Mot de passe
              </PasswordInput>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="font-bold text-[1.4rem] text-right leading-[145%] pt-4 text-primary-base"
          >
            <Link
              href={
                "/auth/forgot-password?entity=Mot de passe oublié&currentStep=1&totalStep=3"
              }
              className="hover:underline"
            >
              Mot de passe oublié?
            </Link>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <ButtonPrimary
              className="mt-[25px] w-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingCircleSmall /> : "Se connecter"}
            </ButtonPrimary>
          </motion.div>
        </form>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="flex flex-col gap-[30px] mt-[30px] mb-[15px] text-center leading-[145%] tracking-[-0.48px]"
      >
        <p className="font-primary text-[16px] text-neutral-500">or</p>
        <button className="w-full bg-black rounded-[5px] text-[16px] font-medium text-white px-[24] py-[16] flex items-center justify-center gap-4">
          <Image src={Google} alt="Google icon" />
          Continuer avec Google
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="flex gap-[5px] justify-center font-secondary leading-[145%]"
      >
        <p className="text-[16px] font-medium tracking-[-0.48px] text-[#A3A3A3]">
          Vous n&apos;avez pas de compte?
        </p>
        <Link
          href={"/auth/register?entity=Inscription&currentStep=1&totalStep=2"}
          className="text-[14px] hover:underline font-bold tracking-[-0.42px] text-primary-base flex items-center"
        >
          Créer un compte
        </Link>
      </motion.div>
    </div>
  );
}
