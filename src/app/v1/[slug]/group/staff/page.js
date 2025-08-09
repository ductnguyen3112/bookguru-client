"use client";

import React, { useState } from "react";
import { UserIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { setStaffPreference } from "@/app/redux/slices/groupSlice";
import { useRouter } from "next/navigation";
import GroupStaff from "@/app/components/group/GroupStaff";
import { setStaffSelection } from "@/app/redux/slices/groupSlice";

export default function GroupStaffSelection() {
  const [selected, setSelected] = useState("any");

 
  const randomSelection = () => {
    setSelected("any");

  };

  if (selected === "specific" ) {
    return <GroupStaff />;
  }

  return (
    <div className="min-h-screen bg-white px-4 md:px-8 py-6 md:py-12">
      {/* Navigation */}

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-3">
        <span>Services</span> &nbsp;&gt;&nbsp;
        <span className="text-black font-medium">Professional</span>{" "}
        &nbsp;&gt;&nbsp;
        <span>Time</span> &nbsp;&gt;&nbsp;
        <span>Confirm</span>
      </nav>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-10">Select staff options</h1>

      {/* Card Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-xl">
        {/* Any Professional */}
        <div
          onClick={() => randomSelection()}
          className={`flex flex-col items-center  max-w-80 justify-center border rounded-xl px-4 py-6 cursor-pointer transition text-center h-40 ${
            selected === "any"
              ? "border-emerald-900"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <UserIcon className="w-7 h-7 mb-3 text-black" />
          <p className="text-sm font-medium text-black">Any professional</p>
          <p className="text-sm text-gray-400 truncate w-full">
            for maximum availability
          </p>
        </div>

        {/* Specific Professional */}
        <div
          onClick={() => setSelected("specific")}
          className={`flex flex-col items-center justify-center border max-w-80  rounded-xl px-4 py-6 cursor-pointer transition text-center h-40 ${
            selected === "specific"
              ? "border-emerald-900"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <UserPlusIcon className="w-7 h-7 mb-3 text-black" />
          <p className="text-sm font-medium text-black truncate w-full">
            Select professional per service
          </p>
        </div>
      </div>
    </div>
  );
}
