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
  const selectedDateRaw = useSelector((state) => state.group.date);
  const [message, setMessage] = useState("");

  const timezone = businessData.businessTimezone;

  // keep a Moment for UI; default to today if none in store
  const [selectedDate, setSelectedDate] = useState(
    selectedDateRaw ? moment(selectedDateRaw, "YYYY-MM-DD") : moment()
  );
  const [selectedTime, setSelectedTime] = useState(null);

  // the array of ISO strings (slot.start)
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch whenever guests, selectedDate, or businessURL changes
  useEffect(() => {
    if (!guests.length || !businessData.businessURL) return;

    const aborter = new AbortController();
    const fetchSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const payload = {
          domain: businessData.businessURL,
          date: selectedDate.format("YYYY-MM-DD"),
          guests,
        };

        const res = await axios.post("/api/booking/group-time", payload, {
          signal: aborter.signal,
        });

        if (res.data.success) {
          const starts = (res.data.slots || []).map((s) => s.start);
          setTimeSlots(starts);
        } else {
          setTimeSlots([]);
          setError(res.data.message || "No slots returned");
          setMessage(res.data.message || "No slots available for this date");
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.response?.data?.error || err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
    return () => aborter.abort();
  }, [guests, businessData.businessURL, selectedDate]);

  // build a 30-day horizontal picker
  const dateRange = Array.from({ length: 30 }, (_, i) => {
    const d = moment().add(i, "days");
    return { key: d.format("YYYY-MM-DD"), momentObj: d };
  });

  const handleDateClick = (d) => {
    setSelectedDate(d);
    dispatch(setGroupDate(d.format("YYYY-MM-DD")));
    setSelectedTime(null);
  };

  const handleTimeSelect = (isoStart) => {
    setSelectedTime(isoStart);
    dispatch(setGroupTime(isoStart));
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
          {dateRange.map(({ key, momentObj }) => {
            const isSel = selectedDate.isSame(momentObj, "day");
            return (
              <button
                key={key}
                onClick={() => handleDateClick(momentObj)}
                className="flex flex-col items-center focus:outline-none"
              >
                <div
                  className={`rounded-2xl w-16 h-16 flex items-center justify-center text-lg font-semibold mb-1 ${
                    isSel
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {momentObj.date()}
                </div>
                <span className="text-xs text-gray-600">
                  {momentObj.format("ddd")}
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
            timeSlots.map((iso, idx) => {
              const isSel = selectedTime === iso;
              return (
                <button
                  key={idx}
                  onClick={() => handleTimeSelect(iso)}
                  className={`w-full text-left border rounded-md py-4 px-4 hover:bg-gray-50 focus:outline-none ${
                    isSel ? "border-indigo-600" : "border-gray-200"
                  }`}
                >
                  {moment(iso).tz(timezone).format("hh:mm A")}
                </button>
              );
            })
          ) : (
            <p className="text-gray-500">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
