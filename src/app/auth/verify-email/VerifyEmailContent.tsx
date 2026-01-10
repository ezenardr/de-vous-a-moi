"use client";
import { motion } from "framer-motion";
import MailboxFill from "@/assets/icons/Mailbox-fill.svg";
import Image from "next/image";
import maskEmail from "@/lib/maskEmail";
import Link from "next/link";

export default function VerifyEmailContent({ email }: { email: string }) {
  return (
    <main className="flex flex-col items-center justify-center gap-12 h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-[100px] h-[100px] bg-secondary-100 flex items-center justify-center rounded-[100px]"
      >
        <Image src={MailboxFill} alt="MailBox icon" />
      </motion.div>
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col gap-[15px] font-secondary text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[32px] text-center font-bold font-primary leading-[120%] tracking-[-0.96px]"
          >
            Consultez votre boîte mail
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[16px] font-secondary font-normal leading-[145%] tracking-[-0.48px] text-[#A3A3A3]"
          >
            Un lien de vérification a été envoyé à votre e‑mail. Cliquez pour
            confirmer votre compte en toute sécurité.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-[16px] font-secondary font-normal leading-[145%] tracking-[-0.48px] text[#767676] px-[1.6rem] py-[.8rem] bg-[#F8F8F8] rounded-[5px]"
        >
          Consultez{" "}
          <span className="text-[#333333] font-bold">{maskEmail(email)}</span>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Link
          href={"/auth/register?entity=Inscription&currentStep=1&totalStep=2"}
          className="text-[14px] hover:underline font-bold tracking-[-0.42px] text-primary-base flex items-center"
        >
          Adresse mail incorrect?
        </Link>
      </motion.div>
    </main>
  );
}
