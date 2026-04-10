import Image from "next/image";
import ShareButton from "@/components/shared/ShareButton";
import Messara from "@/assets/images/messara.jpg";
import AppLayout from "@/components/layouts/AppLayout";

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="flex border-b border-[#F9F9F9]  gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <div className="flex items-center gap-8">
          <span className="hidden lg:flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
            A propos
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <ShareButton
            entity="blog"
            url={`${process.env.NEXT_PUBLIC_APP_URL}/`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-10 lg:gap-14 overflow-y-scroll">
        <section
          data-section={0}
          className="snap-start w-full flex flex-col gap-6"
        >
          <div className="rounded-xl w-full h-160 relative">
            <Image
              className="h-160 object-contain rounded-xl"
              src={Messara}
              alt={"Messara Ezenard"}
              fill
            />
          </div>

          <div className="flex justify-between">
            <h1 className="font-secondary text-[1.8rem] lg:text-8 font-bold leading-[120%] tracking-[-0.6px] text-[#333]">
              Là où l’encre et votre voix s’harmonisent: On le pense, on en
              parle.
            </h1>
          </div>
        </section>

        <section
          data-section={1}
          className="grid grid-cols-1 gap-y-12 lg:grid-cols-3 lg:gap-12 w-full"
        >
          <aside className="lg:sticky lg:top-8 lg:self-start">
            {/* <p className="font-bold text-[2rem] pb-8 text-[#333333]">
              Table des matières
            </p> */}
            <p className="flex flex-col gap-4 text-[1.6rem] text-[#A3A3A3]">
              Créer De Vous à Moi a été l&#39;une des expériences les plus
              incroyables. Nous adorons découvrir les différentes façons dont
              vous explorez notre blog. Parcourez nos articles pour trouver de
              nouvelles perspectives sur la vie, le monde, la culture et
              laissez-vous inspirer.
            </p>
          </aside>

          <div className="col-span-2 w-full flex flex-col gap-8">
            <div className=" w-full flex flex-col text-[1.6rem] text-black">
              Je me suis engagée à écrire le blog De Vous à Moi, parce que je
              crois fermement que les mots ont le pouvoir de transformer des
              idées en expériences partagées. <br />
              <br />
              Chaque jour, mon équipe et moi découvrons de nouvelles raisons
              d’ouvrir nos esprits et de coucher nos pensées sur le papier pour
              les partager avec vous. À travers nos articles, nous explorons une
              multitude de thématiques, offrant des perspectives uniques et
              créant un espace où réflexion et inspiration se rencontrent.{" "}
              <br />
              <br />
              De Vous à Moi est une aventure que nous construisons ensemble,
              avec vous, nos précieux lecteurs. Ce blog est bien plus qu’un
              simple projet d’écriture: c’est un moyen de tisser des liens, de
              susciter des émotions et d’apporter de la valeur à nos lecteurs,
              qu’ils recherchent des conseils pratiques, des récits captivants
              ou des moments d’évasion. <br />
              <br />
              Vos retours, vos échanges et vos inspirations donnent vie à chaque
              mot que nous écrivons, et nous sommes impatients de continuer
              cette belle démarche à vos côtés.
              <br />
              <br /> Messara Ezenard <br />
              Rédactrice en chef
            </div>
          </div>
        </section>
        {/* Stats and comments */}
      </div>
    </AppLayout>
  );
}
