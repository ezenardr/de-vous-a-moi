import { StudioListSkeleton } from "@/components/skeletons/StudioSkeleton";

export default function Loading() {
  return <StudioListSkeleton label="Chargement de vos articles" tabs={3} />;
}
