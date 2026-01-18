import AppLayout from "@/components/layouts/AppLayout";
import { ButtonPrimary } from "@/components/shared/Buttons";

export default function NewArticle() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between p-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Nouvel article
        </span>
        <ButtonPrimary>Publier</ButtonPrimary>
      </div>
    </AppLayout>
  );
}
