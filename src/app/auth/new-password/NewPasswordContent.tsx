"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/shared/Inputs";
import Image from "next/image";
import { ButtonPrimary } from "@/components/shared/Buttons";
import { motion } from "framer-motion";
import { Criteria } from "../register/Criteria";
import Info from "@/assets/icons/Info.svg";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingCircleSmall from "@/components/loaders/LoadingCircleSmall";
import Link from "next/link";

const UpdateSchema = z
  .object({
    password: z
      .string()
      .min(8, "")
      .regex(/[A-Z]/, "")
      .regex(/[a-z]/, "")
      .regex(/[0-9]/, "")
      .regex(/[^A-Za-z0-9]/, ""),

    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  });
type TUpdateSchema = z.infer<typeof UpdateSchema>;

const criteriaList = [
  { regex: /.{8,}/, label: "Au moins 8 caractères" },
  { regex: /[A-Z]/, label: "Lettre majuscule" },
  { regex: /[a-z]/, label: "Lettre minuscule" },
  { regex: /[0-9]/, label: "Chiffre" },
  { regex: /[^A-Za-z0-9]/, label: "Caractère spécial" },
];

export default function NewPasswordContent({ token }: { token: string }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TUpdateSchema>({
    resolver: zodResolver(UpdateSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  const password = watch("password");
  const router = useRouter();
  const onSubmit = async (data: TUpdateSchema) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/new-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
          "Accept-language": "fr",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    if (request.status === 401) {
      toast.error(
        "Ce lien de validation n'existe plus. Veuillez soummetre une nouvelle requête.",
      );
    } else {
      const response = await request.json();
      if (response.success === true) {
        router.push("/auth/login");
      } else {
        toast.error(response.message);
      }
    }
  };

  return (
    <main className="py-36 lg:py-0">
      <div className="flex flex-col gap-10 >">
        <div className="flex flex-col gap-6 font-secondary text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[32px] font-bold font-primary leading-[120%] tracking-[-0.96px]"
          >
            Créer un nouveau mot de passe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[1.6rem] font-secondary font-normal leading-[145%] tracking-[-0.48px] text-[#A3A3A3]"
          >
            Insérez votre nouveau mot de passe ci-dessous. Veuillez à ne pas
            l&apos;oublier cette fois-ci !
          </motion.p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6 font-secondary tracking-[-0.42px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <PasswordInput {...register("password")}>
                Creer un Mot de passe
              </PasswordInput>
              {password && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1, delay: 0.06 }}
                >
                  <div className="mt-[0.8rem] flex flex-col gap-2.5">
                    <div className="flex gap-[0.4rem] font-secondary text-[1.2rem] text-[#333333] tracking-[-0.36px] items-center">
                      <Image src={Info} alt="Infoicon" />
                      <p>
                        Votre mot de passe doit répondre aux critères suivants :
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-[.8rem]">
                      {criteriaList.map(({ regex, label }) => (
                        <Criteria key={label} isValid={regex.test(password)}>
                          {label}
                        </Criteria>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <PasswordInput
                {...register("password_confirmation")}
                error={errors.password_confirmation?.message}
              >
                Confirmer le Mot de passe
              </PasswordInput>
            </motion.div>
          </div>
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
              {isSubmitting ? (
                <LoadingCircleSmall />
              ) : (
                "Mettre à jour votre mot de passe"
              )}
            </ButtonPrimary>
          </motion.div>
        </form>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col gap-12 mt-12 mb-6 text-center leading-[145%] tracking-[-0.48px]"
        >
          <Link
            href={"/auth/login"}
            className="w-full rounded-xl font-secondary text-[1.4rem] leading-[145%] tracking-[-0.42] font-bold text-black flex items-center justify-center"
          >
            Retour
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
