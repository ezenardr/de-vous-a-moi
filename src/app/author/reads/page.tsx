import AppLayout from "@/components/layouts/AppLayout";
import { LinkButtonPrimary } from "@/components/shared/Links";
import Search from "@/assets/icons/SearchLine.svg";
import Image from "next/image";

export default function AuthorReadsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-0 lg:items-center justify-between lg:p-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Mes Articles
        </span>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="p-4 rounded-[5px] w-[330px] bg-[#F8F8F8] flex items-center gap-4 overflow-hidden">
            <Image src={Search} width={20} alt="Search" />
            <input
              type="text"
              className="outline-none text-[1.4rem] leading-[145%]"
              placeholder="Rechercher..."
            />
          </div>
          <LinkButtonPrimary
            className="w-full lg:w-auto"
            href="/author/reads/new"
          >
            Nouvel article
          </LinkButtonPrimary>
        </div>
      </div>
    </AppLayout>
  );
}
