"use client";

import { UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useSelector } from "react-redux";

export default function GuestStaffList() {
  const guests = useSelector((state) => state.group.guests || []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <span>Services &gt; Guests &gt; Time &gt; Confirm</span>
      </nav>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-10">Select professional</h1>

      {/* Guest Blocks */}
      {guests.map((guest, index) => {
        const label = guest.isMainBooker ? "Me" : guest.name;
        const serviceName = guest.services?.[0]?.serviceName || "No service selected";
        const duration = guest.services?.[0]?.duration || 0;

        return (
          <div key={guest.id} className="mb-10">
            <p className="text-xl font-semibold mb-3">{label}</p>

            {/* Rounded Card */}
            <div className=" py-5 space-y-4 w-full max-w-2xl">
              <div>
                <p className="text-md font-bold text-black">{serviceName}</p>
                <p className="text-sm text-gray-500">{duration} mins</p>
              </div>

              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm text-black shadow-xs w-fit hover:bg-gray-50 transition">
                <div className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="mr-2">Any professional</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
