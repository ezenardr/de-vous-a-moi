"use client";
import LoadingCircleSmall from "@/components/loaders/LoadingCircleSmall";
import { ButtonPrimary } from "@/components/shared/Buttons";
import { CreateDraft } from "@/action/reads";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewReadButton() {
  const [isLoading, setIsloading] = useState(false);
  const router = useRouter();
  async function createNewReadDraft() {
    setIsloading(true);
    const response = await CreateDraft();
    if (response.success === true) {
      router.push(`/author/reads/draft/${response.read.readDraftId}`);
    } else {
      toast.error(response.error);
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
