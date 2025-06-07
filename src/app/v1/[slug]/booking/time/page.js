"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import moment from "moment-timezone";
import { addTime, addStaff, addDate, setPreference } from "@/app/redux/slices/dataSlice";

export default function TimeSelection() {
  const dispatch = useDispatch();
  const businessData = useSelector((state) => state.data.business);
  const selectedData = useSelector((state) => state.data.selected);
  const selectedStaff = selectedData.staff;
  const duration = selectedData.duration;
  const timezone = businessData.businessTimezone;
  const preference = selectedData.preference;
  const staffs = useSelector((state) => state.data.business?.staffs || []);

  const preferenceStaff = staffs.find((s) => s._id === selectedStaff);
  const isAnySelected = !preference || !selectedStaff;

  const [selectedDate, setSelectedDate] = useState(
    selectedData.date ? moment(selectedData.date) : moment()
  );
  const [selectedTime, setSelectedTime] = useState(null);
  const selectedDateUTC = selectedDate.clone().utc().toISOString();

  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedDateUTC || !duration || !businessData?.businessURL) return;

    const controller = new AbortController();

    async function fetchTimeSlots() {
      try {
        setLoading(true);

        const payload = {
          domain: businessData.businessURL,
          date: selectedDateUTC,
          duration,
        };

        if (!selectedStaff) {
          payload.staffs = staffs.map((s) => s._id);
        } else {
          payload.staff = selectedStaff;
        }

        const response = await axios.post("/api/booking/get-time", payload, {
          signal: controller.signal,
        });

        if (!selectedStaff && response.data.staff) {
          dispatch(addStaff(response.data.staff));
        }

        setTimeSlots(response.data.slots || []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTimeSlots();

    return () => controller.abort();
  }, [selectedStaff, selectedDateUTC, duration, businessData?.businessURL]);

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
    dispatch(addDate(date));
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    dispatch(addTime(time));
  };

  const handleChange = (e) => {
    const staffId = e.target.value;

    if (staffId === "any") {
      dispatch(addStaff(null));
      dispatch(setPreference(false));
      setSelectedTime(null);
    } else {
      dispatch(addStaff(staffId));
      dispatch(setPreference(true));
      setSelectedTime(null);
    }
  };

  return (
    <div className="w-full mx-auto p-4">
      <nav className="text-sm text-gray-500 mb-3">
        <span>Services &gt; Professional &gt; Time &gt; Confirm</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Select services</h1>
      <div className="slide-animated">
        {/* Staff Selector */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {isAnySelected
                ? "A"
                : preferenceStaff?.staffName?.charAt(0) || "?"}
            </span>
          </div>
          <select
            value={isAnySelected ? "any" : selectedStaff || ""}
            onChange={handleChange}
            className="text-md text-gray-700 p-2 border border-gray-200 rounded-lg font-bold bg-transparent outline-none"
          >
            <option value="any">Any professional</option>
            {staffs.map((staff) => (
              <option key={staff._id} value={staff._id}>
                {staff.staffName}
              </option>
            ))}
          </select>
        </div>

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
                onClick={() => handleTimeSelect(slot.start)}
                className={`w-full text-left border rounded-md py-4 px-4 hover:bg-gray-50 focus:outline-none ${
                  selectedTime === slot.start
                    ? "border-indigo-600"
                    : "border-gray-200"
                }`}
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
