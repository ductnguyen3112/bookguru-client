"use client";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { addStaff, setPreference } from "@/app/redux/slices/dataSlice";

export default function StaffSelection() {
  const dispatch = useDispatch();

  const business = useSelector((state) => state.data.business);

  const { services, preference, staffs, staff } = useSelector(
    (state) => state.data.selected
  );

  const staffMembers = (business?.staffs || []).map((staff) => ({
    id: staff._id,
    staffName: staff.staffName,
    note: staff.staffNote,
  }));

  useEffect(() => {
    if (!services?.length) {
      const pathname = window.location.pathname;
      if (/\/booking\/[^/]+/.test(pathname)) {
        window.location.href = pathname.replace(/\/booking\/[^/]+/, "/booking");
      }
    }
  }, [services]);

  if (!services?.length) return null;

  const filteredStaff = [
    {
      id: "any",
      staffName: "Any professional",
      note: "Maximum availability",
      icon: <UserGroupIcon className="w-8 h-8" />,
    },
    ...staffMembers.filter((staff) => staffs.includes(staff.id)),
  ];

  const selectStaff = (staff) => {
    if (staff.id !== "any") {
      dispatch(setPreference(true));
      dispatch(addStaff(staff.id));
    } else {
      dispatch(setPreference(false));
      dispatch(addStaff(null)); // 🛠️ Clear selected staff
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-3">
        <span>Services &gt; Professional &gt; Time &gt; Confirm</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6">Select professional</h1>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8 slide-animated">
        {filteredStaff.map(({ id, staffName, note, icon }) => {
          const isSelected =
            (preference && id === staff) || (!preference && id === "any");

          return (
            <div key={id} className="w-full">
              <div
                onClick={() => selectStaff({ id, staffName, note })}
                className={`flex flex-col items-center justify-center border rounded-md p-4 cursor-pointer transition-colors aspect-square ${
                  isSelected
                    ? "border-emerald-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {id === "any" && icon ? (
                  <div className="flex items-center  justify-center w-18 h-18 rounded-full bg-gray-100 text-emerald-900 mb-2">
                    {icon}
                  </div>
                ) : (
                  <div className="flex items-center text-2xl justify-center w-18 h-18 rounded-full bg-gray-100 text-emerald-900 mb-2 font-semibold">
                    {staffName?.charAt(0)}
                  </div>
                )}
                <p className="text-md font-medium text-center text-gray-800">
                  {staffName}
                </p>
                {note && (
                  <p className="text-xs hidden md:block text-gray-500 truncate">
                    {note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
