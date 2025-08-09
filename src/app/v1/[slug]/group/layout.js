import React from "react";
import SumaryCard from "@/app/components/single/SumaryCard";
import GroupSumary from "@/app/components/group/GroupSumary";
import SimpleHeader from "@/app/components/common/SimpleHeader";


export default function Layout({ children }) {
  return (
    <section>
      <div className="  min-h-screen">
        <SimpleHeader />
        <div className="p-2 lg:mx-5 ">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-6 max-w-7xl mx-auto">
            <div className="col-span-6 ">{children}</div>
            <div className="col-span-4">
              
              <GroupSumary />
            </div>
          </div>
        </div>
      </div>
  
    </section>
    
  );
}
