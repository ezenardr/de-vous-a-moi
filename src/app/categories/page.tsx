import AppLayout from "@/components/layouts/AppLayout";
import Building from "@/assets/icons/building-fill.svg";
import Teacup from "@/assets/icons/teacup-fill.svg";
import Mic from "@/assets/icons/Mic-fill.svg";
import BoardFill from "@/assets/icons/BoardFill.svg";
import Device from "@/assets/icons/device_line.svg";
import Image from "next/image";
import Link from "next/link";

const categoryMeta = [
  { title: "Actualités", image: Building, color: "#967CCF" },
  { title: "Style de vie", image: Teacup, color: "#CF5AD4" },
  { title: "Le Spotlight", image: Mic, color: "#84C15D" },
  { title: "Technologies", image: Device, color: "#1E63F8" },
];
type MergedCategory = {
  category: string;
  total: number;
  color?: string;
  image?: string;
};

export default async function CategoriesPage() {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    method: "GET",
  });
  const response = await request.json();
  const categories: MergedCategory[] = response.categories.map(
    ({ category, total }: { category: string; total: number }) => {
      const meta = categoryMeta.find((m) => m.title === category);
      return { category, total, ...meta };
    },
  );

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <span className="text-[2rem] font-medium leading-[120%] text-[#333333]">
          Catégories
        </span>
      </div>
      <ul className="list-3 overflow-y-scroll">
        {categories.map(({ category, total, color, image }) => (
          <li
            key={category}
            style={{ backgroundColor: color ?? "#333" }}
            className="h-[250px] rounded-[5px] flex flex-col justify-between"
          >
            <Link
              href={`/categories/${encodeURIComponent(category)}`}
              className="h-[250px] rounded-[5px] flex flex-col justify-between"
            >
              <p className="pt-8 pl-8 font-bold text-[3.6rem] text-white">
                {category}
              </p>
              <div className="flex items-end justify-between">
                <div className="px-4 py-[5px] mb-8 ml-8 rounded-[3rem] w-fit uppercase bg-white flex items-center gap-[5px] text-[1.2rem] font-bold leading-[15px] text-[#333333] font-secondary">
                  <Image
                    src={BoardFill}
                    alt="Board Fill"
                    width={15}
                    height={15}
                  />
                  {total} {total > 1 ? "articles" : "article"}
                </div>
                {image && <Image src={image} alt={category} />}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppLayout>
  );
}
