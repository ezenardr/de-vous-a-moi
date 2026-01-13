"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/shared/Inputs";
import Image from "next/image";
import CheckFill from "@/assets/icons/Check-fill.svg";
import { ButtonPrimary } from "@/components/shared/Buttons";
import { motion } from "framer-motion";
import { Criteria } from "../register/Criteria";
import Info from "@/assets/icons/Info.svg";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const UpdateSchema = z.object({
  password: z
    .string()
    .min(8, "")
    .regex(/[A-Z]/, "")
    .regex(/[a-z]/, "")
    .regex(/[0-9]/, "")
    .regex(/[^A-Za-z0-9]/, ""),
  
  passwordConfirm: z.string(),
})
.refine((data) => data.password === data.passwordConfirm, {
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

export default function NewPasswordContent(){
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TUpdateSchema>({
    resolver: zodResolver(UpdateSchema),
    mode: "onSubmit",         
    reValidateMode: "onSubmit"
  });
  const password = watch("password");
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const onSubmit = async (data: TUpdateSchema) => {
    console.log("Formulaire soumis:", data);
    setIsSuccess(true);
  };
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  return (
    <main className="py-[90px]">
      {!isSuccess && (
        <div className="flex flex-col gap-[25px] >">
          <div className="flex flex-col gap-[15px] font-secondary text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-[32px] font-bold font-primary leading-[120%] tracking-[-0.96px]"
            >
              Create new password
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-[16px] font-secondary font-normal leading-[145%] tracking-[-0.48px] text-[#A3A3A3]"
            >
              Enter your new password below, do not forget it this time!
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
                    <div className="mt-[.8rem] flex flex-col gap-2.5">
                      <div className="flex gap-[.4rem] font-secondary text-[12px] text-[#333333] tracking-[-0.36px] items-center">
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
                  {...register("passwordConfirm")}
                  error={errors.passwordConfirm?.message}
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
                className="mt-[25px]"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </ButtonPrimary>
            </motion.div>
          </form>
        </div>
      )}
      
      {isSuccess && (
        <div className="flex flex-col items-center justify-center gap-12 h-full py-[60px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-[100px] h-[100px] bg-secondary-100 flex items-center justify-center rounded-[100px]"
          >
            <Image src={CheckFill} alt="Check icon" />
          </motion.div>
          <div className="flex flex-col items-center gap-10">
            <div className="flex flex-col gap-[15px] font-secondary text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-[32px] text-center font-bold font-primary leading-[120%] tracking-[-0.96px]"
              >
                Password reset successfully
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-[16px] font-secondary text-[#333333] font-bold leading-[145%] tracking-[-0.48px]"
              >
                Returning you to sign in...
              </motion.p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
