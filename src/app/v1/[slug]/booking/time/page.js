"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment-timezone";

export default function TimeSelection() {
  const businessData = useSelector((state) => state.data.business);
  const selectedData = useSelector((state) => state.data.selected);
  const selectedStaff = selectedData.staffs;
  const duration = selectedData.duration;
  const timezone = businessData.businessTimezone;

  // Local state for selected date, defaulting to current date or Redux value if provided.
  const [selectedDate, setSelectedDate] = useState(
    selectedData.date ? moment(selectedData.date) : moment()
  );

  // Format the selected date for API usage (in UTC)
  const selectedDateUTC = selectedDate.clone().utc().toISOString();

  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch time slots whenever the staff, selected date, or duration changes.
  useEffect(() => {
    async function fetchTimeSlots() {
      try {
        setLoading(true);
        const response = await axios.post("/api/booking/get-time", {
          domain: businessData.businessURL,
          staff: selectedStaff,
          date: selectedDateUTC,
          duration: duration,
        });
        setTimeSlots(response.data.slots);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTimeSlots();
  }, [selectedStaff, selectedDateUTC, duration, businessData.businessURL]);


  if (error) return <div>Error: {error}</div>;

  // Generate a date range for 30 days starting from today.
  const dateRange = Array.from({ length: 30 }, (_, i) => {
    const d = moment().add(i, "days");
    return {
      date: d,
      day: d.date(),
      dayName: d.format("ddd"), // e.g. Mon, Tue, Wed...
    };
  });

  // Update the selected date when a date is clicked.
  const handleDateClick = (d) => {
    setSelectedDate(d);
  };

  return (
    <div className="w-full mx-auto p-4">
      {/* Breadcrumb or step indicator */}
      <nav className="text-sm text-gray-500 mb-3">
        <span>Services &gt; Professional &gt; Time &gt; Confirm</span>
      </nav>

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">Select services</h1>
      <div className="slide-animated">
        {/* Staff Selector */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">J</span>
          </div>
          <button className="flex items-center space-x-1 text-sm text-gray-700 font-medium">
            <span>Jenny Yen</span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 011.04 1.08l-4.24 3.98a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z" />
            </svg>
          </button>
        </div>

        {/* Month label */}
        <div className="mb-4">
          <p className="text-gray-500 font-medium">{selectedDate.format("MMMM YYYY")}</p>
        </div>

        {/* Horizontal date picker */}
        <div className="flex items-center space-x-4 mb-6 overflow-x-auto">
          {dateRange.map((dateObj, index) => {
            const isSelected = selectedDate.isSame(dateObj.date, "day");
            return (
              <button
                key={index}
                onClick={() => handleDateClick(dateObj.date)}
                className="flex flex-col items-center focus:outline-none"
              >
                <div
                  className={`rounded-full w-16 h-16 flex items-center justify-center font-semibold mb-1 ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {dateObj.day}
                </div>
                <span className="text-xs text-gray-600">{dateObj.dayName}</span>
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="space-y-2">
          {timeSlots.length > 0 ? (
            timeSlots.map((slot, index) => (
              <button
                key={index}
                className="w-full text-left border border-gray-200 rounded-md py-4 px-4 hover:bg-gray-50 focus:outline-none"
              >
                {moment(slot.start).tz(timezone).format("hh:mm A")} 
              </button>
            ))
          ) : (
            <p className="text-gray-500">No available time slots.</p>
          )}
        </div>
      </div>
    </div>
  );
}
