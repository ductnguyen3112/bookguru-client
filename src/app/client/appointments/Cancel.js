'use client'
import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

export default function Cancel({ open, appointment, onClose, onConfirm }) {
  if (!open) return null;

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const timezone = appointment?.location?.timezone || moment.tz.guess();

  const handleCancel = async () => {
    if (saving) return;
    setError('');
    try {
      setSaving(true);
      const payload = { appointmentId: appointment?._id, cancel: true };
      const { data } = await axios.put('/api/client/appointment/update', payload);
      if (data?.appointment) {
        onConfirm?.({ appointment: data.appointment });
      } else {
        setError(data?.error || 'Failed to cancel appointment');
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to cancel appointment');
    } finally {
      setSaving(false);
    }
  };

  const dateLabel = appointment?.start
    ? moment(appointment.start).tz(timezone).format('ddd, MMM D, YYYY [at] h:mm A')
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-stretch justify-center">
      {/* Modal container without a back/close icon to discourage going back */}
      <div className="relative bg-white w-full h-screen md:max-w-lg md:h-[60vh] md:mt-24 md:rounded-2xl rounded-none shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-2xl font-bold text-gray-900">Cancel appointment?</h2>
          {dateLabel && (
            <p className="mt-1 text-sm text-gray-500">{dateLabel}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-gray-700">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </p>
          {appointment?.location?.business && (
            <p className="mt-3 text-gray-500 text-sm">
              Business: <span className="font-medium text-gray-700">{appointment.location.business}</span>
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white md:rounded-b-2xl grid grid-cols-2 gap-3 mb-2">
          <button
            className="rounded-lg border border-gray-300 text-gray-700 font-semibold py-3 hover:bg-gray-50"
            onClick={onClose}
            disabled={saving}
          >
            Keep appointment
          </button>
          <button
            className="rounded-lg bg-red-600 text-white font-semibold py-3 hover:bg-red-700 disabled:opacity-50"
            onClick={handleCancel}
            disabled={saving}
          >
            {saving ? 'Cancelling…' : 'Cancel appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
