import { StudioListSkeleton } from "@/components/skeletons/StudioSkeleton";

export default function Loading() {
  return <StudioListSkeleton label="Chargement de vos vidéos" tabs={2} />;
}
