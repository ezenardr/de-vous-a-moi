"use client";
import CheckMark from "@/assets/icons/CheckBig.svg";
import LoadingDots from "@/components/loaders/LoadingDots";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
export default function VerifiedPageContent({
  accessToken,
}: {
  accessToken: string;
}) {
  const router = useRouter();
  useEffect(function () {
    async function completeRegistration() {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/complete-registration/${accessToken}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
      );
      const response = await request.json();
      if (response.success) {
        const result = await signIn("credentials", {
          email: response.user.email,
          password: response.user.password,
          redirect: false,
          callbackUrl: process.env.NEXT_PUBLIC_APP_URL,
        });
        if (result?.error) {
          toast.error("Email ou mot de passe incorrect");
        } else {
          router.push("/");
        }
      } else {
        toast.error(response.message);
      }
    }
    completeRegistration();
  });
  return (
    <div className="flex flex-col gap-12 items-center h-full justify-center overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Image src={CheckMark} alt="succes icon" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-secondary text-center font-bold text-[3.2rem] leading-[120%] text-black"
      >
        Compte vérifié avec succès
      </motion.h3>
      <motion.span
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="font-secondary text-center font-bold text-[1.4rem] flex items-center gap-4 leading-[145%] text-primary-base"
      >
        Connexion en cours
        <LoadingDots />
      </motion.span>
    </div>
  );
}
