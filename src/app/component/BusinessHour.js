import React from "react";

export default function BusinessHours({ data }) {
  // Get the business hours from the data
  const workHours = data?.workHours || {};
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get the current day name (e.g., "Monday")
  const currentDay = days[new Date().getDay()];

  // Reorder days: current day first, then the rest in order
  const orderedDays = [currentDay, ...days.filter((day) => day !== currentDay)];

  return (
    <div className="p-4 mt-5 bg-white  rounded md:flex md:space-x-8">
      {/* Left column: Business Hours */}
      <div className="md:w-1/2">
        <h2 className="text-lg font-semibold mb-4">Business Hours</h2>
        <ul className="space-y-2">
          {orderedDays.map((day) => {
            const hours = workHours[day];
            return (
              <li
                key={day}
                className={`flex items-center justify-between text-md p-2 rounded ${
                  day === currentDay ? "bg-blue-100 font-bold" : ""
                }`}
              >
                <div className="flex items-center">
                  {/* Bullet: green if open, gray if closed */}
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      hours?.isOpen ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                  <span>{day}</span>
                </div>
                <div>
                  {hours?.isOpen ? `${hours.open} – ${hours.close}` : "Closed"}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right column: Additional information */}
      <div className="md:w-1/2 mt-6 md:mt-0">
        <h2 className="text-lg font-semibold mb-4">Additional information</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center">
            {/* Example checkmark icon (using Heroicons or your own) */}
            <svg
              className="h-5 w-5 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="ml-2">Instant Confirmation</span>
          </li>
          {/* Add more items here if needed */}
        </ul>
      </div>
    </div>
  );
}
