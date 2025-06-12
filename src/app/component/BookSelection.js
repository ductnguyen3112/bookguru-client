"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { setBookSelection } from "../redux/slices/dataSlice";

export default function BookSelection() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current path

  const isOpen = useSelector((state) => state.data.bookSelection);

  if (!isOpen) return null;

  const onClose = () => {
    dispatch(setBookSelection(false));
  };

  const groupAppointment = () => {
    router.push(`${pathname}/group`);
    onClose();
  };

  const bookAppointment = () => {
    router.push(`${pathname}/booking`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 slide-up">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Choose an option
        </h2>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Book</h3>
        <button
          className="w-full text-left border border-gray-300 rounded-lg p-4 mb-4 hover:bg-gray-100 transition"
          onClick={bookAppointment}
        >
          <div className="font-medium text-gray-800">Book an appointment</div>
          <div className="text-sm text-gray-500">
            Schedule services for yourself
          </div>
        </button>
        <button
          className="w-full text-left border border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition"
          onClick={groupAppointment}
        >
          <div className="font-medium text-gray-800">Group appointment</div>
          <div className="text-sm text-gray-500">For yourself and others</div>
        </button>
      </div>
    </div>
  );
}
