"use client";

import Image from "next/image";
import logo from "@/assets/logos/logo-white.png";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-primary-base flex flex-col items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center gap-10 max-w-[520px] w-full">
        <Image src={logo} alt="De vous à moi" width={120} height={40} />

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(159,232,112,0.1)",
            border: "1.5px solid rgba(159,232,112,0.25)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9fe870"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-white font-secondary font-bold text-[2.6rem] lg:text-[3.2rem] leading-[120%] tracking-[-0.5px]">
            Une interruption momentanée
          </h1>
          <p className="text-[1.5rem] lg:text-[1.6rem] text-white/60 leading-[170%]">
            Notre équipe est déjà au travail pour résoudre ce problème.{" "}
            <br className="hidden lg:block" />
            Le blog sera de retour très prochainement — merci de votre patience.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full bg-secondary-base text-primary-base font-semibold text-[1.5rem] hover:bg-secondary-500 transition-colors cursor-pointer"
          >
            Réessayer
          </button>

          <a
            href="https://www.facebook.com/messara.ezenard.2025"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full border border-white/20 text-white/70 font-medium text-[1.5rem] hover:border-white/40 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Suivez-nous sur Facebook
          </a>
        </div>

        <p className="text-white/25 text-[1.3rem] tracking-wide uppercase">
          De vous à moi
        </p>
      </div>
    </div>
  );
}
