import AppLayout from "@/components/layouts/AppLayout";
import Search from "@/assets/icons/SearchLine.svg";
import Image from "next/image";
import NewReadButton from "./NewReadButton";
import ReadsPageContent from "./ReadsPageContent";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { userPolicy } from "@/lib/role/userPolicy";
import { ReadDraft } from "@/types/types";

export default async function AuthorReadsPage() {
  const session = await auth();
  const authorized = await userPolicy.createReads(session?.user.userId ?? "");
  if (!authorized) {
    redirect("/");
  }
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reads/author`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    },
  );
  const response = await request.json();
  const drafts: ReadDraft[] = response.drafts;
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-0 lg:items-center justify-between lg:pt-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Mes Articles
        </span>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="p-4 rounded-[5px] w-[330px] bg-[#F8F8F8] hidden lg:flex items-center gap-4 overflow-hidden">
            <Image src={Search} width={20} alt="Search" />
            <input
              type="text"
              className="outline-none text-[1.4rem] leading-[145%]"
              placeholder="Rechercher..."
            />
          </div>
          <div className="hidden lg:block">
            <NewReadButton />
          </div>
        </div>
      </div>
      <ReadsPageContent drafts={drafts} />
      <div className="lg:hidden absolute bottom-8 right-8 z-60">
        <NewReadButton />
      </div>
    </AppLayout>
  );
}
