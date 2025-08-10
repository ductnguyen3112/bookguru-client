'use client'
import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment-timezone';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Reschedule modal styled similar to booking/time page with staff switch and day/time selection
export default function Reschedule({ open, onClose, appointment, onConfirm }) {
  if (!open) return null;

  const apptDuration = Number(appointment?.duration || 30);
  const initialStaff = appointment?.staff || null;

  // Derive business slug from appointment.location.url (last segment) or use business name as fallback
  const businessSlug = useMemo(() => {
    const rawUrl = appointment?.location?.url || '';
    const seg = rawUrl?.split('/').filter(Boolean).pop();
    return seg || rawUrl || '';
  }, [appointment?.location?.url]);

  // Business data for timezone and staffs
  const [business, setBusiness] = useState(null);
  const timezone = business?.businessTimezone || moment.tz.guess();
  const staffs = useMemo(() => business?.staffs || [], [business]);

  // UI state
  const [selectedStaff, setSelectedStaff] = useState(initialStaff);
  const [preference, setPreference] = useState(Boolean(initialStaff));
  const [selectedDate, setSelectedDate] = useState(() => (
    appointment?.start ? moment(appointment.start) : moment()
  ));
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [resolvedStaff, setResolvedStaff] = useState(initialStaff);

  // Load business data (staffs, timezone)
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!businessSlug) return;
      try {
        const { data } = await axios.get(`/api/booking/${encodeURIComponent(businessSlug)}`);
        if (!active) return;
        const next = data?.business || null;
        setBusiness((prev) => {
          // only update if changed to avoid re-renders
          if (!prev && next) return next;
          if (prev && next && String(prev.businessURL) !== String(next.businessURL)) return next;
          return prev || next;
        });
      } catch (e) {
        // Silent fail; fetching slots might still work with existing slug
      }
    };
    load();
    return () => { active = false; };
  }, [businessSlug]);

  // Fetch time slots when date/staff/duration/business changes
  useEffect(() => {
    let cancelled = false;
    const fetchSlots = async () => {
      if (!businessSlug) return;
      setLoading(true);
      setError('');
      setTimeSlots([]);
      setSelectedTime(null);
      try {
        const payload = {
          domain: business?.businessURL || businessSlug,
          date: selectedDate.clone().utc().toISOString(),
          duration: apptDuration,
        };
        if (!selectedStaff) {
          // any professional
          const ids = (staffs || []).map((s) => s._id);
          if (!ids.length) {
            // wait for staffs to load before querying
            setLoading(false);
            return;
          }
          if (ids.length) payload.staffs = ids;
        } else {
          payload.staff = selectedStaff;
        }

        const { data } = await axios.post('/api/booking/get-time', payload);
        if (cancelled) return;
        if (data?.success) {
          setTimeSlots(data.slots || []);
          if (!selectedStaff && data.staff) {
            setResolvedStaff(data.staff);
          }
        } else {
          setError(data?.error || data?.message || 'Failed to load slots');
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.error || e.message || 'Failed to load slots');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSlots();
    return () => { cancelled = true; };
  }, [businessSlug, business?.businessURL, selectedDate, apptDuration, selectedStaff, staffs]);

  // Date range for the horizontal selector (30 days)
  const dateRange = useMemo(() => {
    const base = moment().startOf('day');
    return Array.from({ length: 30 }, (_, i) => {
      const d = base.clone().add(i, 'days');
      return { date: d, day: d.date(), dayName: d.format('ddd') };
    });
  }, []);

  const handleDateClick = (d) => {
    setSelectedDate(moment(d));
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot.start);
  };

  const handleStaffChange = (e) => {
    const v = e.target.value;
    if (v === 'any') {
      setSelectedStaff(null);
      setPreference(false);
      setResolvedStaff(null);
      setSelectedTime(null);
    } else {
      setSelectedStaff(v);
      setPreference(true);
      setResolvedStaff(v);
      setSelectedTime(null);
    }
  };

  const [saving, setSaving] = useState(false);
  const handleConfirm = async () => {
    if (!selectedTime || saving) return;
    try {
      setSaving(true);
      const start = selectedTime;
      const slotObj = timeSlots.find((s) => s.start === start);
      const end = slotObj?.end || moment(selectedTime).add(apptDuration, 'minutes').toISOString();
      const staff = selectedStaff || resolvedStaff || initialStaff;

      const payload = {
        appointmentId: appointment?._id,
        start,
        end,
        staff,
      };
      const { data } = await axios.put('/api/client/appointment/update', payload);
      if (data?.appointment) {
        onConfirm?.({ start, end, staff, appointment: data.appointment });
        onClose?.();
      } else {
        setError(data?.error || 'Failed to update appointment');
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to update appointment');
    } finally {
      setSaving(false);
    }
  };

  const isAnySelected = !preference || !selectedStaff;
  const preferenceStaff = staffs?.find((s) => s._id === selectedStaff);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-stretch justify-center">
      <div className="relative bg-white w-full h-screen md:max-w-lg md:h-[90vh] md:mt-8 md:mb-10 md:rounded-2xl rounded-none shadow-xl flex flex-col">
        {/* Close */}
        <button
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-2xl font-bold text-gray-900">Reschedule appointment</h2>
          {appointment?.start && (
            <p className="mt-1 text-sm text-gray-500">Current: {moment(appointment.start).tz(timezone).format('ddd, MMM D, YYYY [at] h:mm A')}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Staff selector */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-900">
                {isAnySelected ? 'A' : (preferenceStaff?.staffName?.charAt(0) || '?')}
              </span>
            </div>
            <select
              value={isAnySelected ? 'any' : (selectedStaff || '')}
              onChange={handleStaffChange}
              className="text-md text-gray-700 p-2 border border-gray-200 rounded-lg font-bold bg-transparent outline-none"
            >
              <option value="any">Any professional</option>
              {staffs?.map((staff) => (
                <option key={staff._id} value={staff._id}>{staff.staffName}</option>
              ))}
            </select>
          </div>

          {/* Month label */}
          <div className="mb-4">
            <p className="text-gray-500 font-medium">{selectedDate.format('MMMM YYYY')}</p>
          </div>

          {/* Horizontal date picker */}
          <div className="flex items-center space-x-4 mb-6 overflow-x-auto">
            {dateRange.map((obj, idx) => {
              const isSelected = selectedDate.isSame(obj.date, 'day');
              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(obj.date)}
                  className="flex flex-col items-center focus:outline-none"
                >
                  <div className={`${isSelected ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'} rounded-2xl w-16 h-16 flex items-center justify-center text-lg font-semibold mb-1`}>
                    {obj.day}
                  </div>
                  <span className="text-xs text-gray-600">{obj.dayName}</span>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          <div className="space-y-2">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : timeSlots.length > 0 ? (
              timeSlots.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => handleTimeSelect(slot)}
                  className={`w-full text-left border rounded-md py-4 px-4 hover:bg-gray-50 focus:outline-none ${selectedTime === slot.start ? 'border-gray-900' : 'border-gray-200'}`}
                >
                  {moment(slot.start).tz(timezone).format('hh:mm A')}
                </button>
              ))
            ) : (
              <p className="text-gray-500">No available time slots.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4  bg-white md:rounded-b-2xl grid grid-cols-2 gap-3 mb-2">
          <button className="rounded-lg border border-gray-300 text-gray-700 font-semibold py-3 hover:bg-gray-50" onClick={onClose}>Cancel</button>
          <button
            className="rounded-lg bg-gray-900 text-white font-semibold py-3 hover:bg-black disabled:opacity-50"
            disabled={!selectedTime || saving}
            onClick={handleConfirm}
          >
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
