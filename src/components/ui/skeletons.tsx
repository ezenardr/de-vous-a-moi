
// Loading animation
const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";
export function SimpleArtworkCardSkeleton() {
  return (
    <div className="${shimmer}  flex flex-col gap-y-4 relative">
      <div className="px-4 py-4 h-[2.8rem] w-[2.8rem] bg-gray-100 z-50 rounded-full flex items-center absolute top-4 right-4"></div>
      <div className="rounded-[5px] h-100 w-full bg-[#F9F9F9] overflow-hidden relative">
        <div className="bg-white absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col gap-4 rounded-[1.5rem]">
          <div className="flex items-center gap-4">
            <div className="rounded-full w-12 h-12 bg-[#F9F9F9]" />
            <span className="w-40 h-8 bg-[#F9F9F9]"></span>
          </div>
          <div className="flex gap-[5px]">
            <div className="pl-2 pr-4 py-2 h-10 rounded-[3rem] w-44 bg-[#F9F9F9] flex items-center"></div>
            <div className="pl-2 pr-4 py-2 h-10 rounded-[3rem] w-[7.6rem]  bg-[#F9F9F9] flex items-center "></div>
            <div className="pl-2 pr-4 py-2 h-10 rounded-[3rem] w-[7.9rem] uppercase bg-[#F9F9F9] flex items-center "></div>
          </div>
        </div>
      </div>
      <span className="bg-[#F9F9F9] h-[2.3rem] w-100"></span>
    </div>
  );
}

export default function ReadsSkeleton() {
  return (
    <>
      <div
        className={"${shimmer}"}
      />
      <div className="flex  lg:border-b border-[#F9F9F9] items-center justify-between lg:py-8">
        <div className="h-[2.4rem] w-[6rem] bg-[#F9F9F9]">
        </div>
      </div>
      <div className="flex flex-col gap-12 lg:gap-10 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-10">
          <div className="col-span-2">
            <div className="w-full flex flex-col gap-4">
              <div className="rounded-[5px] w-full h-[363px] lg:h-160 relative">
                <div className="px-4 py-4 h-[2.8rem] w-[2.8rem] bg-gray-100 z-50 rounded-full flex items-center absolute top-4 right-4"></div>
                <div className="min-h-140 lg:h-160 bg-[#F9F9F9] rounded-[5px]" />
                <div className="bg-white absolute z-50 bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-[5px] flex flex-col lg:flex-row gap-4 justify-between rounded-[1.5rem]">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full w-12 h-12 bg-[#F9F9F9]" />
                    <span className="w-40 h-8 bg-[#F9F9F9]"></span>
                  </div>
                  <div className="flex gap-x-2 items-center">
                    <div className="pl-2 pr-4 py-2 h-10 rounded-[3rem] w-44 bg-[#F9F9F9] flex items-center"></div>
                    <div className="pl-2 pr-4 py-2 h-10 rounded-[3rem] w-[7.6rem]  bg-[#F9F9F9] flex items-center "></div>
                    <div className="pl-2 pr-4 py-2 h-10 rounded-[3rem] w-44 uppercase bg-[#F9F9F9] flex items-center "></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-[#F9F9F9] h-[2.4rem] w-[33rem] "></div>
                <div className="min-w-152 lg:w-240 bg-[#F9F9F9] w-[60rem] h-[4rem]"></div>
              </div>
            </div>
          </div>

          <div>
            <div className="w-full flex flex-col gap-4">
              <div className="rounded-[5px] w-full  relative h-[363px] lg:h-160">
                <div className="px-4 py-4 h-[2.8rem] w-[2.8rem] bg-gray-100 z-50 rounded-full flex items-center absolute top-4 right-4"></div>
                <div className="min-h-140 lg:h-160 lg:w-150 rounded-[5px] bg-[#F9F9F9]" />
                <div className="bg-white absolute bottom-4 left-[50%] -translate-x-[50%] w-full max-w-[95%] p-2 flex flex-col gap-4 rounded-[1.5rem]">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full w-12 h-12 bg-[#F9F9F9]" />
                    <span className="w-40 h-8 bg-[#F9F9F9]"></span>
                  </div>
                  <div className="flex gap-2">
                    <div className="pl-2 pr-4 py-2 h-10 rounded-[3rem] w-44 bg-[#F9F9F9] flex items-center"></div>
                    <div className="pl-2 pr-4 py-2 h-10 rounded-[3rem] w-[7.6rem]  bg-[#F9F9F9] flex items-center "></div>
                    <div className="pl-2 pr-4 py-2 h-10 rounded-[3rem] w-44 uppercase bg-[#F9F9F9] flex items-center "></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-[#F9F9F9] w-[19rem] h-[2.4rem]"></div>
                <div className="bg-[#F9F9F9] w-[37rem] h-[4rem]"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex justify-between font-secondary font-bold items-center">
            <div className=" h-[3rem] w-[11rem] bg-[#F9F9F9]"></div>
            <div className="flex items-center bg-[#F9F9F9] h-[2.4rem] w-[7rem]"></div>
          </div>
          <ul className="list-3 pt-4 gap-4">
            {Array.from({ length: 6 }).map((_, key) => (
              <li key={key}>
                <SimpleArtworkCardSkeleton />
              </li>
            ))}
            <div></div>
          </ul>
        </div>
      </div>
      );
    </>
  );
}
