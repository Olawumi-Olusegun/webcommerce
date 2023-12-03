import React from "react";
import GridView from "@components/GridView";

export default function Loading() {
  const dummyData = Array(12).fill("");

  return (
    <div className='max-w-screen-xl mx-auto p-4 md:p-0 '>
        <div className="p-4 space-y-6 animate-pulse">
        <div className="lg:h-[380px] md:h-[300px] h-[250px] bg-gray-300"></div>

        <GridView>
            {dummyData.map((_, index) => {
            return (
                <div key={index} className="w-full aspect-square bg-gray-300" />
            );
            })}
        </GridView>
        </div>
    </div>
  );
}
