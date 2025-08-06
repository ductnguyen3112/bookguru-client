"use client";
import React from "react";

import { useDispatch } from "react-redux";
import { setBookSelection } from "../redux/slices/dataSlice";

// Helper to format time as "h:mm AM/PM"
function formatTime(hours, minutes) {
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, "0");
  return `${hour12}:${minuteStr} ${suffix}`;
}

// Function to determine open status based on workHours and current time
function getOpenStatus(workHours) {
  const now = new Date();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = dayNames[now.getDay()];
  const todaySchedule = workHours[dayName];

  // If the salon is not scheduled to be open today
  if (!todaySchedule || !todaySchedule.isOpen) {
    return "Closed today";
  }

  // Convert open/close times to minutes from midnight
  const [openHour, openMin] = todaySchedule.open.split(":").map(Number);
  const [closeHour, closeMin] = todaySchedule.close.split(":").map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (currentMinutes < openMinutes) {
    return `Opens today at ${formatTime(openHour, openMin)}`;
  } else if (currentMinutes > closeMinutes) {
    return "Closed for today";
  } else {
    return `Open until ${formatTime(closeHour, closeMin)}`;
  }
}

const Index = ({ data }) => {
  // Destructure needed data
  const dispatch = useDispatch();
  const { businessName, businessAddress, catalogue, workHours } = data;

  // Calculate total services across all catalogue categories
  const totalServices = catalogue.reduce(
    (acc, category) => acc + category.categoryServices.length,
    0
  );

  // Dynamically calculate open status based on workHours and current time
  const openStatus = getOpenStatus(workHours);

  const handleBookNow = () => {
    // Dispatch action to open booking modal
    dispatch(setBookSelection(true));
  };

  // Placeholder for reviews
  const reviews = 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:sticky md:top-5 block">
      <div className="md:mx-10 border border-gray-300 rounded-lg shadow-sm bg-white p-4">
        {/* Business Name */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-1 hidden md:block">
          {businessName}
        </h2>

        {/* Reviews */}
        {reviews > 0 ? (
          <p className="text-gray-600 text-sm mb-4 hidden md:block">
            {reviews} reviews
          </p>
        ) : (
          <p className="text-gray-600 text-sm mb-4 hidden md:block">
            No reviews yet
          </p>
        )}

        {/* Total Services */}
        <p className="text-sm text-gray-700 mb-2">
          Total services: {totalServices} available
        </p>

        {/* Book Now Button */}
        <button
          onClick={handleBookNow}
          className="w-full bg-gray-800 text-white py-3 rounded-full text-sm font-medium hover:bg-gray-700 mb-2"
        >
          Book now
        </button>

        <div className="hidden md:block">
          {/* Open Status */}
          <p className="text-sm text-gray-700 mb-2">{openStatus}</p>

          {/* Address + Get Directions */}
          <div className="flex flex-col text-sm text-gray-700">
            <span>{businessAddress}</span>
            <a href="#" className="text-blue-600 hover:underline mt-1">
              Get directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
