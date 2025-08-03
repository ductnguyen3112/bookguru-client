"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import moment from "moment-timezone";
import {
  setGroupTime,
  setGroupDate,
  updateGuest,
} from "@/app/redux/slices/groupSlice";

export default function Page() {
  const dispatch = useDispatch();
  const businessData = useSelector((state) => state.data.business);
  const guests = useSelector((state) => state.group.guests);
  const selectedDateRaw = useSelector((state) => state.group.date);
  
  // ✅ Get selected time from Redux store
  const selectedTimeFromStore = useSelector((state) => state.group.time);
  
  const [message, setMessage] = useState("");

  const timezone = businessData.businessTimezone;

  // keep a Moment for UI; default to today if none in store
  const [selectedDate, setSelectedDate] = useState(
    selectedDateRaw ? moment(selectedDateRaw, "YYYY-MM-DD") : moment()
  );
  
  // ✅ Use Redux store as source of truth for selected time
  const [selectedTime, setSelectedTime] = useState(selectedTimeFromStore);

  // the array of ISO strings (slot.start)
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Sync local state with Redux store when store changes
  useEffect(() => {
    setSelectedTime(selectedTimeFromStore);
  }, [selectedTimeFromStore]);

  // ✅ Create stable references to prevent unnecessary re-fetches
  const guestsStableRef = React.useMemo(() => {
    return guests.map(guest => ({
      id: guest._id,
      services: guest.services,
      staff: guest.staff,
      duration: guest.duration,
      staffs: guest.staffs
    }));
  }, [guests.map(g => `${g.id}-${g.services?.length}-${g.staff}-${g.duration}`).join(',')]);

  const selectedDateString = selectedDate.format("YYYY-MM-DD");

  // Fetch whenever guests structure, selectedDate, or businessURL changes
  // ✅ Removed selectedTime from dependencies to prevent reload on time selection
  useEffect(() => {
    if (!guestsStableRef.length || !businessData.businessURL) return;

    const aborter = new AbortController();
    const fetchSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const payload = {
          domain: businessData.businessURL,
          date: selectedDateString,
          guests: guestsStableRef,
        };

        const res = await axios.post("/api/booking/group-time", payload, {
          signal: aborter.signal,
        });
        
        console.log("Received time slots:", res.data);

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
  }, [guestsStableRef, businessData.businessURL, selectedDateString]);

  // build a 30-day horizontal picker
  const dateRange = Array.from({ length: 30 }, (_, i) => {
    const d = moment().add(i, "days");
    return { key: d.format("YYYY-MM-DD"), momentObj: d };
  });

  const handleDateClick = useCallback((d) => {
    setSelectedDate(d);
    dispatch(setGroupDate(d.format("YYYY-MM-DD")));
    
    // ✅ Clear selected time when date changes
    setSelectedTime(null);
    dispatch(setGroupTime(null));
  }, [dispatch]);

  const handleTimeSelect = useCallback((isoStart) => {
    // ✅ Update both local state and Redux store
    setSelectedTime(isoStart);
    dispatch(setGroupTime(isoStart));

    // ✅ Batch the guest updates to prevent multiple dispatches
    const guestUpdates = guests.map((guest) => {
      const endTime = moment
        .utc(isoStart)
        .add(guest.duration || 0, "minutes")
        .toISOString();

      return {
        id: guest.id,
        data: {
          start: isoStart,
          end: endTime,
        },
      };
    });

    // Dispatch all updates at once
    guestUpdates.forEach(update => {
      dispatch(updateGuest(update));
    });
  }, [dispatch, guests]);

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