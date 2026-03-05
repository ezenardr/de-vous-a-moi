"use client";
import { TabsContent } from "@/components/ui/tabs";
import { Read, User } from "@/types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formaDate } from "@/lib/formatDate";
import ToggleIcon from "@/components/shared/ToggleIcon";
import { useState } from "react";
import { SetFeatured } from "@/action/reads";
import { useSession } from "next-auth/react";
import PageLoader from "@/components/loaders/PageLoader";
import { toast } from "sonner";

export default function ReadTabsContent({ reads }: { reads: Read[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  async function setFeatured(read: Read, featured: boolean) {
    setIsLoading(true);
    const result = await SetFeatured({
      user: session?.user as User,
      read,
      featured,
    });
    if (result.success !== true) {
      toast.error(result.error);
    }
    setIsLoading(false);
  }
  return (
    <>
      <PageLoader isLoading={isLoading} />
      <TabsContent value="reads" className="w-full h-full overflow-y-scroll">
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[200px] lg:w-auto">Titre</TableHead>
              <TableHead className="hidden lg:table-cell">Autheur</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Plus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {[...reads]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((read) => {
                return (
                  <TableRow key={read.readId}>
                    <TableCell className="font-medium max-w-[200px] overflow-hidden">
                      {read.title}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {read.user.firstName} {read.user.lastName}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formaDate(read.createdAt).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-right">
                      <label
                        className={`relative inline-block h-12 w-20 rounded-full bg-[#E8E8E8] transition [-webkit-tap-highlight-color:transparent] peer-disabled:cursor-not-allowed has-checked:bg-primary-base cursor-pointer`}
                      >
                        <input
                          className="peer sr-only disabled:cursor-not-allowed"
                          id="newRead"
                          defaultChecked={read.featured}
                          name={"newRead"}
                          type="checkbox"
                          onChange={(e) => setFeatured(read, e.target.checked)}
                          disabled={isLoading}
                        />
                        <ToggleIcon />
                      </label>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TabsContent>
    </>
  );
}
