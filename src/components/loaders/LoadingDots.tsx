import React from "react";

export default function LoadingDots() {
  return (
    <div className="flex flex-row gap-2">
      <div className="w-2 h-2 rounded-full bg-primary-base animate-bounce [animation-delay:.7s]"></div>
      <div className="w-2 h-2 rounded-full bg-primary-base animate-bounce [animation-delay:.3s]"></div>
      <div className="w-2 h-2 rounded-full bg-primary-base animate-bounce [animation-delay:.7s]"></div>
    </div>
  );
}
