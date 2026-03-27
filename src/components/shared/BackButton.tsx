"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="p-4 rounded-xl bg-[#F8F8F8] flex items-center cursor-pointer"
    >
      <ChevronLeft width={20} height={20} />
    </button>
  );
}
