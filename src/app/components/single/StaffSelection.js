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

  const staffMembers = (business?.staffs || []).map((s) => ({
    id: s._id,
    staffName: s.staffName,
    note: s.staffNote,
  }));

  useEffect(() => {
    if (!services?.length) {
      const path = window.location.pathname;
      if (/\/booking\/[^/]+/.test(path)) {
        window.location.href = path.replace(/\/booking\/[^/]+/, "/booking");
      }
    }
  }, [services]);

  if (!services?.length) return null;

  const filteredStaff = [
    {
      id: "any",
      staffName: "Any professional",

      icon: <UserGroupIcon className="w-6 h-6 text-purple-600" />,
    },
    ...staffMembers.filter((s) => staffs.includes(s.id)),
  ];

  const selectStaff = (s) => {
    if (s.id !== "any") {
      dispatch(setPreference(true));
      dispatch(addStaff(s.id));
    } else {
      dispatch(setPreference(false));
      dispatch(addStaff(null));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-3">
        Services &gt; Professional &gt; Time &gt; Confirm
      </nav>
      <h1 className="text-2xl font-bold mb-6">Select professional</h1>

      {/* Flexible grid: 2 cols on xs, 3 on sm, 4 on md+ */}
      <div className="grid grid-cols-3 gap-6">
        {filteredStaff.map(({ id, staffName, note, icon }) => {
          const isSelected =
            (preference && id === staff) || (!preference && id === "any");

          return (
            <button
              key={id}
              onClick={() => selectStaff({ id, staffName, note })}
              className={`
    aspect-square
    border rounded-xl p-4
    flex flex-col justify-center items-center
    text-center cursor-pointer
    hover:bg-gray-100/30 transition-colors
    ${isSelected ? "border-indigo-700" : "border-gray-300"}
  `}
            >
              <div className="bg-gray-100 p-2 rounded-full mb-2 w-12 h-12 flex items-center justify-center">
                {id === "any" ? (
                  icon
                ) : (
                  <span className="text-lg font-semibold text-gray-700">
                    {staffName.charAt(0)}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-800">{staffName}</p>
              {note && (
                <p className="text-xs text-gray-500 mt-1 truncate">{note}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
