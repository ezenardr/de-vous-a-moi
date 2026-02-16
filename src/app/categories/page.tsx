import AppLayout from "@/components/layouts/AppLayout";
import Building from "@/assets/icons/building-fill.svg";
import Teacup from "@/assets/icons/teacup-fill.svg";
import Mic from "@/assets/icons/Mic-fill.svg";
import BoardFill from "@/assets/icons/BoardFill.svg";
import Device from "@/assets/icons/device_line.svg";
import Image from "next/image";
import Search from "@/assets/icons/SearchLine.svg";

export default function CategoriesPage() {
  const categories = [
    {
      title: "Actualités",
      image: Building,
      color: "#967CCF",
    },
    {
      title: "Style de vie",
      image: Teacup,
      color: "#CF5AD4",
    },
    {
      title: "Le Spotlight",
      image: Mic,
      color: "#84C15D",
    },
    {
      title: "Technologies",
      image: Device,
      color: "#1E63F8",
    },
  ];
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Catégories
        </span>
        <div className="p-4 rounded-[5px] w-[330px] bg-[#F8F8F8] hidden lg:flex items-center gap-4 overflow-hidden">
          <Image src={Search} width={20} alt="Search" />
          <input
            type="text"
            className="outline-none text-[1.4rem] leading-[145%]"
            placeholder="Rechercher..."
          />
        </div>
      </div>
      <ul className="list-3 overflow-y-scroll">
        {categories.map((item) => {
          return (
            <li
              key={item.title}
              style={{ backgroundColor: item.color }}
              className={`h-[250px] rounded-[5px] flex flex-col justify-between`}
            >
              <p className="pt-8 pl-8 font-bold text-[3.6rem] text-white">
                {item.title}
              </p>
              <div className="flex items-end justify-between">
                <div className="px-4 py-[5px] mb-8 ml-8 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                  <Image
                    src={BoardFill}
                    alt="Board Fill"
                    width={15}
                    height={15}
                  />
                  30 articles
                </div>
                <Image src={item.image} alt={item.title} />
              </div>
            </li>
          );
        })}
      </ul>
    </AppLayout>
  );
}
