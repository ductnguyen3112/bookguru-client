"use client";
import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setBookSelection } from "../redux/slices/dataSlice"; // Adjust the import path as necessary

export default function BookSelection() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.data.bookSelection);

  if (!isOpen) return null;

  const onClose = () => {
    dispatch(setBookSelection(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Choose an option
        </h2>

        {/* Subheading */}
        <h3 className="text-lg font-medium text-gray-800 mb-4">Book</h3>

        {/* Option: Book an Appointment */}
        <button
          className="w-full text-left border border-gray-300 rounded-lg p-4 mb-4 hover:bg-gray-100 transition"
          onClick={() => alert("Book an appointment")}
        >
          <div className="font-medium text-gray-800">Book an appointment</div>
          <div className="text-sm text-gray-500">
            Schedule services for yourself
          </div>
        </button>

        {/* Option: Group Appointment */}
        <button
          className="w-full text-left border border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition"
          onClick={() => alert("Group appointment")}
        >
          <div className="font-medium text-gray-800">Group appointment</div>
          <div className="text-sm text-gray-500">For yourself and others</div>
        </button>
      </div>
    </div>
  );
}
