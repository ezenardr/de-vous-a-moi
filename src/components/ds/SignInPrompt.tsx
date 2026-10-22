"use client";
import { usePathname } from "next/navigation";
import { UserAdd2FillIcon } from "@/components/icons/mingcute";
import { Button, ButtonLink } from "./Button";
import { Modal } from "./Modal";

export const SIGN_IN_PROMPTS = {
  save: {
    title: "Sauvegarder la lecture",
    description:
      "Vous devez être connecté pour sauvegarder des lectures. Connectez-vous pour garder une trace de vos histoires préférées et reprendre là où vous vous êtes arrêté.",
    cta: "Se connecter pour sauvegarder",
  },
  saved: {
    title: "Vos favoris",
    description: "Connectez-vous pour retrouver les lectures que vous avez sauvegardées, sur tous vos appareils.",
    cta: "Se connecter",
  },
  react: {
    title: "Aimer et commenter",
    description: "Connectez-vous pour aimer les lectures et partager vos impressions avec les autres lecteurs.",
    cta: "Se connecter",
  },
} as const;

// Figma "Save read" (153:11910): explains why signing in is needed, "Go back" + primary sign-in button.
export function SignInPrompt({
  open,
  onOpenChange,
  reason,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: keyof typeof SIGN_IN_PROMPTS;
}) {
  const pathname = usePathname();
  const copy = SIGN_IN_PROMPTS[reason];
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={copy.title} description={copy.description}>
      <div className="flex w-full flex-col-reverse gap-8 sm:flex-row">
        <Button variant="secondary" size="lg" className="sm:flex-1" onClick={() => onOpenChange(false)}>
          Retour
        </Button>
        <ButtonLink href={`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`} size="lg" icon={UserAdd2FillIcon}>
          {copy.cta}
        </ButtonLink>
      </div>
    </Modal>
  );
}
