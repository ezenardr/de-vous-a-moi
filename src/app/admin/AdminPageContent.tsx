"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Read } from "@/types/types";
import ReadTabsContent from "./ReadTabsContent";

export default function AdminPageContent({ reads }: { reads: Read[] }) {
  return (
    <Tabs defaultValue="reads" className="w-full h-full overflow-y-hidden">
      <TabsList className="w-full lg:w-fit flex">
        <TabsTrigger value="reads" className="w-full">
          Articles
        </TabsTrigger>
        {/* <TabsTrigger value="users" className="w-full">
          Utilisateurs
        </TabsTrigger> */}
      </TabsList>
      <ReadTabsContent reads={reads} />
    </Tabs>
  );
}
