"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { subscribeNewsletter } from "@/action/newsletter";
import { AuthHeading, FormNotice, StatusIcon } from "@/components/auth/AuthCard";
import { Dots, SubmitButton } from "@/components/auth/AuthButtons";
import { TextField } from "@/components/auth/TextField";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { MailOpenFillIcon } from "@/components/icons/mingcute";
import { emailSchema } from "@/lib/validation/auth";
import { BotGuard, useBotGuard } from "@/components/bot/BotGuard";

const schema = z.object({ email: emailSchema });
type Values = z.input<typeof schema>;

// Figma "Subscribe to newsletter": form 153:16245 (mobile 156:52706), success 153:16801 (156:54132).
// Bot checks (BotGuard): Turnstile for visitors, the honeypot and the time since the dialog opened.
// Mounted afresh each time it opens (SiteDialogsProvider keys it).
export function NewsletterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState<string>();
  const guard = useBotGuard({ enabled: !signedIn });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
    // Readers get their own address filled in.
    defaultValues: { email: session?.user?.email ?? "" },
  });

  // "Returning you to reads": the success screen closes itself.
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => onOpenChange(false), 2400);
    return () => clearTimeout(timer);
  }, [done, onOpenChange]);

  async function onSubmit(values: Values) {
    setNotice(undefined);
    const result = await subscribeNewsletter({ ...values, ...guard.fields });
    guard.used();
    if (result.success) setDone(true);
    else setNotice(result.message);
  }


  // One dialog throughout, so the switch to the success screen doesn't flash.
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      banner={!done}
      hideHeader={done}
      title={done ? "Inscription confirmée" : "Restons liés par les histoires"}
      description={
        done ? undefined : "Rejoignez notre newsletter pour recevoir des lectures, des réflexions et un peu d'inspiration, de moi à vous."
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-[3rem] py-16 lg:py-[7rem]">
          <StatusIcon icon={MailOpenFillIcon} />
          <AuthHeading title="Bienvenue dans notre cercle de lecteurs." />
          <p className="flex items-center gap-[0.5rem] type-body font-bold text-primary-base" role="status">
            Retour aux lectures
            <Dots />
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative flex flex-col gap-[2.5rem]">
          {notice && <FormNotice>{notice}</FormNotice>}
          <TextField label="Votre adresse email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
          <BotGuard {...guard.props} />
          <ModalActions>
            <ModalBackButton />
            <div className="lg:w-[32rem]">
              <SubmitButton disabled={!isValid || !guard.ready} pending={isSubmitting}>
                S&apos;abonner
              </SubmitButton>
            </div>
          </ModalActions>
        </form>
      )}
    </Modal>
  );
}
