"use client";
import Image from "next/image";
import BG from "@/assets/images/auth_bg.webp";
import Logo from "@/assets/logos/logo.png";
import Pen from "@/assets/icons/Pen.svg";
import UserSecurity from "@/assets/icons/UserSecurity.svg";
import Pull from "@/assets/icons/PullIcon.svg";
import { GitPullRequest } from "lucide-react";
import LockIcon from "@/assets/icons/LockFill.svg";
import { useSearchParams } from "next/navigation";

export default function layout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const entity = searchParams.get("entity");
  const currentStep = searchParams.get("currentStep");
  const totalStep = searchParams.get("totalStep");
  return (
    <div className="bg-white lg:p-10 h-dvh overflow-hidden flex flex-col">
      <div className="lg:flex p-2.5 items-center gap-[5px] hidden">
        <Image
          src={Logo}
          width={35}
          height={35}
          alt="Logo"
          className="w-auto h-auto"
        />
        <span className="font-secondary font-bold text-primary-base text-[2rem] leading-[120%]">
          De vous à moi
        </span>
      </div>
      <div className="h-full relative overflow-y-hidden">
        <Image src={BG} className="w-full h-full" alt="auth background" />
        <div className="absolute top-[45px] left-[15px] flex items-center gap-[5px] lg:hidden">
          <Image
            src={Logo}
            width={35}
            height={35}
            alt="Logo"
            className="w-auto h-auto"
          />
          <span className="font-secondary font-bold text-white text-[2rem] leading-[120%]">
            De vous à moi
          </span>
        </div>
        {!entity || !currentStep || !totalStep ? null : (
          <div className="bg-[#F8F8F8] absolute top-20 lg:top-10 right-6 lg:right-10 pl-4 lg:pl-[1.6rem] pr-4 lg:pr-[.4rem] py-2 lg:py-[.4rem] flex gap-8 rounded-[10px] font-primary leading-[145%] items-center bg-blur-[5px]">
            <div className="text-[16px] text-[#A3A3A3] font-bold tracking-[-0.48]">
              {" "}
              <span className="text-black">{currentStep}</span> of {totalStep}
            </div>
            <div className="bg-[#FFFFFF] hidden lg:flex gap-[.8rem] px-[1.6rem] py-[.8rem] rounded-[10px] items-center">
              {entity === "Inscription" && (
                <Image src={Pen} alt="Penicon" />
              )}
              {entity === "Verification" && (
                <Image src={UserSecurity} alt="User Icon" />
              )}
              {entity === "Request reset" && (
                <Image src={Pull} alt="Request Icon" />
              )}
              {entity === "Password creation" && (
                <Image src={LockIcon} alt="Lock Icon" />
              )}
              <span className="text-[14px] font-medium tracking-[-0.42px]">
                {" "}
                {entity}
              </span>
            </div>
          </div>
        )}

        <div className="absolute top-[114px] lg:top-[50%] lg:left-[50%] lg:-translate-x-[50%] lg:-translate-y-[50%] bg-white p-[15px] py-[30px] lg:py-18 lg:p-18 rounded-[20px] w-full lg:w-[490px] lg:max-w-[490px] h-auto max-h-[90%] overflow-auto scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
}
