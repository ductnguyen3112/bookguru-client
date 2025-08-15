"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function BookingConfirmPage() {
  const business = useSelector((state) => state.data.business);
  const { time, cost } = useSelector((state) => state.data.selected);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  // Compute details and auto-redirect
  useEffect(() => {
    if (time && business?.businessTimezone) {
      const start = moment(time).tz(business.businessTimezone);
      setAppointmentDetails({
        date: start.format("MMMM DD, YYYY"),
        time: start.format("h:mm A"),
      });

      const timer = setTimeout(() => {
        if (business.businessDomain) {
          window.location.href = `${business.businessDomain}`;
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [time, business]);

  if (!appointmentDetails || !business) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointment Confirmed!
          </h1>
          <p className="text-gray-600">
            Your appointment has been successfully booked.
          </p>
        </div>

        {/* Business Info */}
        <div className="border-b border-gray-200 pb-6 mb-6 flex items-center space-x-4">
          {business.businessLogo && (
            <img
              src={business.businessLogo}
              alt={business.businessName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {business.businessName}
            </h2>
            <p className="text-gray-600">{business.businessAddress}</p>
            <a
              href={`tel:${business.businessPhone}`}
              className="text-blue-600 hover:underline"
            >
              {business.businessPhone}
            </a>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-lg text-gray-900">{appointmentDetails.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time</p>
              <p className="text-lg text-gray-900">{appointmentDetails.time}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-lg text-gray-900">${cost}</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You’ll receive a confirmation email shortly</li>
            <li>• Please arrive 5-10 minutes before your appointment</li>
            <li>• Contact us if you need to reschedule or cancel</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={() => window.location.href = `/v1/${business.businessURL}`}
            className="bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Back to {business.businessName}
          </button>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-center text-sm text-gray-500 mt-4">
          You will be redirected to the home page in 5 seconds.
        </p>
      </div>
    </div>
  );
}
