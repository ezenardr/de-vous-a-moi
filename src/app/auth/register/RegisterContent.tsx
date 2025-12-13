"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { Input, PasswordInput } from "@/components/shared/Inputs";
import Google from "@/assets/icons/Google.svg";
import Image from "next/image";
import Link from "next/link";
import { ButtonPrimary } from "@/components/shared/Buttons";
import { motion } from "framer-motion";
import { Criteria } from "./Criteria";
import Info from "@/assets/icons/Info.svg";
import { StepCounter } from "./StepCounter";



const RegisterSchema = z.object({
  firstname: z.string().min(1, "Prénom requis"),
  lastname: z.string().min(1, "Nom requis"),
  email: z.email("Adresse email invalide"),
  password: z.string()
  .min(8, "")
  .regex(/[A-Z]/, "")
  .regex(/[a-z]/, "")
  .regex(/[0-9]/, "")
  .regex(/[^A-Za-z0-9]/, ""),

});
type TRegisterSchema = z.infer<typeof RegisterSchema>;

const criteriaList = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "Uppercase letter" },
  { regex: /[a-z]/, label: "Lowercase letter" },
  { regex: /[0-9]/, label: "Number" },
  { regex: /[^A-Za-z0-9]/, label: "Special character" },
];

export default function RegisterContent() {

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TRegisterSchema>({
    resolver: zodResolver(RegisterSchema),
  });
  const password = watch("password");
  const onSubmit = async (data: TRegisterSchema) => {
    console.log("Formulaire soumis:", data);
    redirect("/auth/login");
  };

  return (
    <div>
      <div className="absolute top-[30px] left-1/2 -translate-x-1/2 z-50">
        <StepCounter />
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-[15px] font-secondary text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[32px] font-bold font-primary leading-[120%] tracking-[-0.96px]"
          >
            Create your account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[16px] font-secondary font-normal leading-[145%] tracking-[-0.48px] text-[#A3A3A3]"
          >
            Start your journey of shared stories, reflections, and moments that speak to you.
          </motion.p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6 font-secondary tracking-[-0.42px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="w-full flex gap-2.5">
                <Input {...register("firstname")} error={errors.firstname?.message}>
                  First name
                </Input>
                <Input {...register("lastname")} error={errors.lastname?.message}>
                  Last name
                </Input>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Input {...register("email")} error={errors.email?.message}>
                Adresse mail
              </Input>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <PasswordInput
                {...register("password")}
                // error={errors.password?.message}
              >
                Creer un Mot de passe
              </PasswordInput>
              {password && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1, delay: 0.06 }}
                >
                    <div className="mt-[8px] flex flex-col gap-2.5">
                      <div className="flex gap-[4px] font-secondary text-[12px] text-[#333333] tracking-[-0.36px] items-center">
                        <Image src={Info} alt="Infoicon" />
                        <p>Your password must meet these criteria:</p>
                      </div>
                      <div className="flex flex-wrap gap-[8px]">
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
              {isSubmitting ? "Creating..." : "Create account"}
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
          Vous avez deja un compte?
        </p>
        <Link
          href={"/auth/login"}
          className="text-[14px] hover:underline font-bold tracking-[-0.42px] text-primary-base flex items-center"
        >
          Se connecter
        </Link>
      </motion.div>
    </div>
  );
}
