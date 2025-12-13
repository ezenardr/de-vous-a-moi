import Image from "next/image"
import Pen from "@/assets/icons/Pen.svg";

export function StepCounter(){
  return (
    <div className="bg-[#F8F8F8] pl-[16px] pr-[4px] py-[4px] flex gap-[20px] rounded-[10px] font-primary leading-[145%] items-center bg-blur-[5px]">
      <div className="text-[16px] text-[#A3A3A3] font-bold tracking-[-0.48]"> <span className="text-[#000]">1</span> of 2</div>
      <div className="bg-[#FFFFFF] flex gap-[8px] px-[16px] py-[8px] rounded-[10px] items-center">
        <Image src={Pen} alt="Penicon" />
        <span className="text-[14px] font-medium tracking-[-0.42px]"> Sign up</span>
      </div>
    </div>
  )
}
