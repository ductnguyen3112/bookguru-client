"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import moment from "moment-timezone";
import { setGroupTime, setGroupDate } from "@/app/redux/slices/groupSlice";

export default function Page() {
  const dispatch = useDispatch();
  const businessData = useSelector((state) => state.data.business);
  const guests = useSelector((state) => state.group.guests);
  console.log(useSelector((state) => state.group));

  const timezone = businessData.businessTimezone;
  const selectedDateRaw = useSelector((state) => state.group.date);

  const [selectedDate, setSelectedDate] = useState(
    selectedDateRaw ? moment(selectedDateRaw) : moment()
  );
  const [selectedTime, setSelectedTime] = useState(null);
  const selectedDateUTC = selectedDate.clone().utc().toISOString();

  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedDateUTC || !guests.length || !businessData?.businessURL) return;

    const controller = new AbortController();

    async function fetchTimeSlots() {
      try {
        setLoading(true);

        const payload = {
          domain: businessData.businessURL,
          date: selectedDateUTC,
          guests,
        };

        const response = await axios.post("/api/booking/group-time", payload, {
          signal: controller.signal,
        });

        setTimeSlots(response.data.availableTimes || []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTimeSlots();

    return () => controller.abort();
  }, [guests, selectedDateUTC, businessData?.businessURL]);

  if (error) return <div>Error: {error}</div>;

  const dateRange = Array.from({ length: 30 }, (_, i) => {
    const d = moment().add(i, "days");
    return {
      date: d,
      day: d.date(),
      dayName: d.format("ddd"),
    };
  });

  const handleDateClick = (d) => {
    const date = moment(d).format("YYYY-MM-DD");
    setSelectedDate(d);
    dispatch(setGroupDate(date));
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    dispatch(setGroupTime(time));
  };

  return (
    <div className="w-full mx-auto p-4">
      <nav className="text-sm text-gray-500 mb-3">
        <span>Guests &gt; Services &gt; Time &gt; Confirm</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Select group time</h1>
      <div className="slide-animated">
        {/* Month label */}
        <div className="mb-4">
          <p className="text-gray-500 font-medium">
            {selectedDate.format("MMMM YYYY")}
          </p>
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
                  className={`rounded-2xl w-16 h-16 flex items-center justify-center text-lg font-semibold mb-1 ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {dateObj.day}
                </div>
                <span className="text-xs text-gray-600">
                  {dateObj.dayName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : timeSlots.length > 0 ? (
            timeSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => handleTimeSelect(slot.time)}
                className={`w-full text-left border rounded-md py-4 px-4 hover:bg-gray-50 focus:outline-none ${
                  selectedTime === slot.time
                    ? "border-indigo-600"
                    : "border-gray-200"
                }`}
              >
                {moment(slot.time).tz(timezone).format("hh:mm A")}
              </button>
            ))
          ) : (
            <p className="text-gray-500">No available time slots for the group.</p>
          )}
        </div>
      </div>
    </div>
  );
}
