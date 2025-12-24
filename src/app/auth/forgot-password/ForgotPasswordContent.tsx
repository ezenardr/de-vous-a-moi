"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/shared/Inputs";
import Image from "next/image";
import Link from "next/link";
import { ButtonPrimary } from "@/components/shared/Buttons";
import { motion } from "framer-motion";
import Info from "@/assets/icons/Info.svg";
import { useRouter } from "next/navigation";

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
    console.log("Formulaire soumis:", data);
    router.push(
      `/auth/verify-email?email=${encodeURIComponent(
        "ezenardr.dev@gmail.com"
      )}&entity=Verification&currentStep=2&totalStep=3`
    );
  };

  return (
    <main className="flex flex-col justify-center">
      <div className="flex flex-col gap-10 my-auto">
        <div className="flex flex-col gap-[15px] font-secondary text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[32px] font-bold font-primary leading-[120%] tracking-[-0.96px]"
          >
            Reset password
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[16px] font-secondary font-normal leading-[145%] tracking-[-0.48px] text-[#A3A3A3]"
          >
            Enter your email address below so we help you generate a new password.
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

          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ButtonPrimary
              className="mt-[25px]"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Wait..." : "Request reset link"}
            </ButtonPrimary>
          </motion.div>
        </form>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="flex flex-col gap-[30px] mt-[30px] mb-[15px] text-center leading-[145%] tracking-[-0.48px]"
      >
        <button className="w-full rounded-[5px] font-secondary text-[14px] leading-[145%] tracking-[-0.42] font-bold text-black flex items-center justify-center">
          Back
        </button>
      </motion.div>
    </main>
  );
}

