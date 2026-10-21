export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
// import Search from "@/assets/icons/SearchLine.svg";
import NewReadButton from "./NewReadButton";
import ReadsPageContent from "./ReadsPageContent";
import { authorOrRedirect } from "@/server/auth/guards";
import { getAuthorReadsAndDrafts } from "@/server/queries/studio";

export default async function AuthorReadsPage() {
  const user = await authorOrRedirect();
  const { drafts, reads } = await getAuthorReadsAndDrafts(user.userId);
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-0 lg:items-center justify-between lg:pt-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Mes Articles
        </span>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* <div className="p-4 rounded-[5px] w-[330px] bg-[#F8F8F8] hidden lg:flex items-center gap-4 overflow-hidden">
            <Image src={Search} width={20} alt="Search" />
            <input
              type="text"
              className="outline-none text-[1.4rem] leading-[145%]"
              placeholder="Rechercher..."
            />
          </div> */}
          <div className="hidden lg:block">
            <NewReadButton />
          </div>
        </div>
      </div>
      <ReadsPageContent drafts={drafts} reads={reads} />
      <div className="lg:hidden absolute bottom-8 right-8 z-60">
        <NewReadButton />
      </div>
    </AppLayout>
  );
}
