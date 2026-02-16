"use client";
import LoadingCircleSmall from "@/components/loaders/LoadingCircleSmall";
import { ButtonPrimary } from "@/components/shared/Buttons";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewReadButton() {
  const [isLoading, setIsloading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  async function createNewReadDraft() {
    setIsloading(true);
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reads/drafts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
        // body: JSON.stringify({ userId: session?.user.userId }),
      },
    );
    const response = await request.json();
    if (response.success === true) {
      router.push(`/author/reads/draft/${response.read.readDraftId}`);
    } else {
      toast.error(response.message);
      setIsloading(false);
    }
  }
  return (
    <ButtonPrimary onClick={createNewReadDraft} disabled={isLoading}>
      <span className="hidden lg:block">
        {isLoading ? <LoadingCircleSmall /> : "Nouvel article"}
      </span>
      <span className="lg:hidden">
        {isLoading ? <LoadingCircleSmall /> : <Plus />}
      </span>
    </ButtonPrimary>
  );
}
