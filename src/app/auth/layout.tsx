import Image from "next/image";
import BG from "@/assets/images/auth_bg.webp";
import Logo from "@/assets/logos/logo.png";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white lg:p-10 h-dvh overflow-hidden">
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
      <div className="h-full relative">
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

        <div className="absolute top-[114px] lg:top-[50%] lg:left-[50%] lg:-translate-x-[50%] lg:-translate-y-[50%] bg-white p-18 rounded-[20px] w-full lg:w-[490px] lg:max-w-[490px] h-[90%] overflow-auto scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
}
