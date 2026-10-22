import AppLayout from "@/components/layouts/AppLayout";
import { UnsubscribeCard } from "./UnsubscribeCard";

export const metadata = { title: "Newsletter", referrer: "no-referrer", robots: { index: false } };

// Link in every newsletter email: /newsletter/unsubscribe?token=…
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <AppLayout className="items-center justify-center">
      <section className="flex w-full max-w-[40rem] flex-col gap-[3rem] py-16">
        <UnsubscribeCard token={token} />
      </section>
    </AppLayout>
  );
}
