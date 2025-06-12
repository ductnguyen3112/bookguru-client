"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addGuest,
  setCurrentGuest,
  removeGuestById,
} from "@/app/redux/slices/groupSlice";
import { goBack } from "@/app/helper/helper";

export default function Page() {
  const guests = useSelector((state) => state.group.guests);
  const allowedGuests = useSelector((state) => state.group.allowedGuests);
  const dispatch = useDispatch();
  const guestIdCount = guests.length + 1;

  const handleAddGuest = () => {
    if (guests.length < allowedGuests) {
      dispatch(setCurrentGuest(guestIdCount));
      goBack();
      dispatch(addGuest());
    } else {
      alert(`You can only add up to ${allowedGuests} guests.`);
    }
  };

  const handleEditService = (id) => {
    dispatch(setCurrentGuest(id));
    goBack();
  };

  const removeGuest = (id) => {
    dispatch(removeGuestById(id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Add guests and services
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Book a group appointment for up to {allowedGuests} guests
        </p>
      </div>

      {/* Guest List */}
      <div className="space-y-4 relative z-0 overflow-visible">
        {guests
          .filter((guest) => guest.name && guest.name.trim() !== "")
          .map((guest, index) => (
            <div
              key={guest.id}
              className="relative flex items-center justify-between p-4 border border-gray-200 rounded-xl"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    guest.name
                  )}&background=random`}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-black">{guest.name}</p>
                  <p className="text-sm text-gray-500">
                    {guest.services?.length
                      ? guest.services.length > 2
                        ? `${guest.services.length} services`
                        : guest.services.map((s) => s.serviceName).join(", ")
                      : "No service selected"}
                  </p>
                </div>
              </div>

              {/* Action Menu */}
              <Menu as="div" className="relative inline-block text-left z-10">
                <MenuButton className="flex items-center rounded-full text-gray-500 hover:text-gray-600">
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon className="w-6 h-6" aria-hidden="true" />
                </MenuButton>

                <MenuItems className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <div className="py-1">
                    <MenuItem>
                      {({ active }) => (
                        <a
                          onClick={() => handleEditService(guest.id)}
                          className={`block w-full text-left p-4 font-bold text-md ${
                            active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                          }`}
                        >
                          Edit service
                        </a>
                      )}
                    </MenuItem>

                    {index > 0 && (
                      <MenuItem>
                        {({ active }) => (
                          <a
                            onClick={() => removeGuest(guest.id)}
                            className={`block w-ful font-bold text-left p-4 text-md ${
                              active ? "bg-gray-100 text-red-800" : "text-red-700"
                            }`}
                          >
                            Remove guest
                          </a>
                        )}
                      </MenuItem>
                    )}
                  </div>
                </MenuItems>
              </Menu>
            </div>
          ))}
      </div>

      {/* Add Guest Button */}
      <div className="mt-6">
        <button
          onClick={handleAddGuest}
          disabled={guests.length >= allowedGuests}
          className="flex items-center border border-gray-300 text-sm px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl mr-2">＋</span> Add guest
        </button>
      </div>
    </div>
  );
}
