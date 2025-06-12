"use client";

import React, { useState } from "react";
import { UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { updateGuestStaff } from "@/app/redux/slices/groupSlice";

function GroupStaffModal({ open, onClose, guest, guests, onSelect }) {
  const business = useSelector((state) => state.data.business);

  const allStaffs = business?.staffs || [];

  if (!open || !guest) return null;

  // ✅ Convert guest.staffs (array of staff IDs) into full staff objects
  const availableStaffs = (guest.staffs || [])
    .map((id) => allStaffs.find((s) => s._id === id))
    .filter(Boolean); // filter out nulls if ID not found

  // filtet out any staff that already chosen by other guests and reassign to available staffs
  const filteredStaffs = availableStaffs.filter((staff) => {
    return !guests.some((g) => g.id !== guest.id && g.staff === staff._id);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40  flex items-center justify-center ">
      <div className="bg-white  w-full max-w-3xl lg:min-h-[50vh] min-h-[30vh] rounded-2xl  shadow-lg p-6 relative mx-5 slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-2">
          {guest.name || "Select Staff"}
        </h2>

        <div className="grid  grid-cols-3 lg:gap-5 gap-3 mt-6 lg:p-5">
          {/* Any professional */}
          <button
            onClick={() => {
              onSelect(guest.id, "any");
              onClose();
            }}
            className="lg:aspect-square w-full border border-gray-300 rounded-xl p-4 text-center hover:bg-gray-100/30 flex flex-col justify-center"
          >
            <div className="bg-gray-100 text-purple-600  p-2 rounded-full mx-auto mb-2 w-fit">
              <UserIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">Any professional</p>
            <p className="text-xs text-gray-500 hidden lg:block">
              for maximum availability
            </p>
          </button>

          {filteredStaffs.map((staff) => (
            <button
              key={staff._id}
              onClick={() => {
                onSelect(guest.id, staff._id);
                onClose();
              }}
              className="lg:aspect-square w-full max-w-lg border border-gray-300 rounded-xl p-4 text-center hover:bg-gray-100/30 flex flex-col justify-center"
            >
              <div className="w-15 h-15 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-sm font-medium text-gray-700">
                {staff?.staffName?.charAt(0)}
              </div>
              <p className="text-sm font-medium">{staff?.staffName}</p>
              {staff?.rating && (
                <span className="text-xs mt-1 bg-black text-white px-2 py-0.5 rounded-full">
                  {staff?.rating} ★
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GuestStaffList() {
  const guests = useSelector((state) => state.group.guests || []);
  const business = useSelector((state) => state.data.business);
  const dispatch = useDispatch();

  const [modalGuestId, setModalGuestId] = useState(null);

  const handleStaffChange = (guestId, staffId) => {
    dispatch(updateGuestStaff({ guestId, staff: staffId }));
  };

  const selectedGuest = guests.find((g) => g.id === modalGuestId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-6">
        <span>Services &gt; Guests &gt; Time &gt; Confirm</span>
      </nav>

      <h1 className="text-2xl font-bold mb-10">Select professional</h1>

      {guests.map((guest) => {
        const label = guest.isMainBooker ? "Me" : guest.name;
        const serviceName =
          guest.services?.[0]?.serviceName || "No service selected";
        const duration = guest.services?.[0]?.duration || 0;

        const servicesName = guest.services?.length
          ? guest.services.length > 1
            ? `${serviceName} and ${
                guest.services.length - 1
              } additional service${guest.services.length > 2 ? "s" : ""}`
            : serviceName
          : "No service selected";

        return (
          <div key={guest.id} className="mb-10">
            <p className="text-xl font-semibold mb-3">{label}</p>

            <div className="py-5 space-y-4 w-full max-w-2xl rounded-xl border border-gray-200 bg-white  px-6">
              <div>
                <p className="text-md font-bold text-black">{servicesName}</p>
                <p className="text-sm text-gray-500">{duration} mins</p>
              </div>

              <button
                className="flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm text-black shadow-xs w-fit hover:bg-gray-50 transition"
                onClick={() => setModalGuestId(guest.id)}
              >
                <div className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="mr-2">
                  {guest.staff === "any" || !guest.staff
                    ? "Any professional"
                    : business.staffs?.find((s) => s._id === guest.staff)
                        ?.staffName || "Select professional"}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Modal */}
      <GroupStaffModal
        open={!!modalGuestId}
        onClose={() => setModalGuestId(null)}
        guest={selectedGuest}
        guests={guests}
        onSelect={handleStaffChange}
      />
    </div>
  );
}
