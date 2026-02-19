"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/shared/Inputs";
import Link from "next/link";
import { ButtonPrimary } from "@/components/shared/Buttons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import LoadingCircleSmall from "@/components/loaders/LoadingCircleSmall";
import { toast } from "sonner";

const RegisterSchema = z.object({
  email: z.email("Adresse email invalide"),
});
type TRegisterSchema = z.infer<typeof RegisterSchema>;

export default function ForgotPasswordContent() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TRegisterSchema>({
    resolver: zodResolver(RegisterSchema),
  });
  const router = useRouter();
  const onSubmit = async (data: TRegisterSchema) => {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
          "Accept-Language": "fr",
        },
        body: JSON.stringify(data),
      },
    );
    const response = await request.json();
    if (response.success === true) {
      router.push(
        `/auth/forgot-password/verify-email?email=${encodeURIComponent(
          data.email,
        )}&entity=Mot de passe oublié&currentStep=2&totalStep=3`,
      );
    } else if (response.success === "warning") {
      toast.warning(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <main className="h-full flex items-cente py-32 overflow-x-hidden">
      <div className="flex flex-col justify-center">
        <div className="flex flex-col gap-10 my-auto">
          <div className="flex flex-col gap-6 font-secondary text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-[3.2rem] font-bold font-primary leading-[120%] tracking-[-0.96px]"
            >
              Mot de passe oublié
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-[1.6rem] font-secondary font-normal leading-[145%] tracking-[-0.48px] text-[#A3A3A3]"
            >
              Saisissez votre adresse e-mail ci-dessous afin que nous puissions
              vous aider à générer un nouveau mot de passe.
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
                  Adresse email
                </Input>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ButtonPrimary
                className="mt-[25px] w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingCircleSmall /> : "Soumettre"}
              </ButtonPrimary>
            </motion.div>
          </form>
        </div>
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
