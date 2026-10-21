"use client";
import CheckMark from "@/assets/icons/CheckBig.svg";
import LoadingDots from "@/components/loaders/LoadingDots";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { completeRegistration } from "@/server/actions/auth";
export default function VerifiedPageContent({
  accessToken,
}: {
  accessToken: string;
}) {
  const router = useRouter();
  const started = useRef(false);
  useEffect(
    function () {
      // Run once, even under StrictMode's double effect.
      if (started.current) return;
      started.current = true;
      async function finish() {
        const response = await completeRegistration(accessToken);
        if (!response.success) {
          toast.error(response.message);
          return;
        }
        const result = await signIn("registration", {
          token: accessToken,
          redirect: false,
        });
        if (result?.error) {
          toast.error("Votre compte est créé. Veuillez vous connecter.");
          router.push("/auth/login");
        } else {
          router.push("/");
        }
      }
      finish();
    },
    [accessToken, router],
  );
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
