"use client";

import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import moment from "moment-timezone";

export default function GroupConfirmPage() {
  const business = useSelector((state) => state.data.business);
  const guests = useSelector((state) => state.group.guests);
  const time = useSelector((state) => state.group.time);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  // Calculate group details
  const groupDuration = Math.max(...guests.map((g) => g.duration || 0));
  const totalCost = guests.reduce((sum, guest) => sum + (guest.cost || 0), 0);
  const timezone = business?.businessTimezone || "America/New_York";

  useEffect(() => {
    if (time && business?.businessTimezone) {
      const startTime = moment(time).tz(timezone);
      const endTime = startTime.clone().add(groupDuration, "minutes");

      setAppointmentDetails({
        date: startTime.format("MMMM DD, YYYY"),
        startTime: startTime.format("h:mm A"),
        endTime: endTime.format("h:mm A"),
        duration: groupDuration,
      });
    }

    // Redirect to home after 10 seconds
    const redirectTimer = setTimeout(() => {
      if (business.businessDomain) {
        window.location.href = `https://${business.businessDomain}`;
      }
    }, 10000);

    return () => clearTimeout(redirectTimer);
  }, [time, timezone, groupDuration, business]);

  if (!appointmentDetails || !business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Group Appointment Confirmed!
          </h1>
          <p className="text-gray-600">
            Your group appointment has been successfully booked.
          </p>
        </div>

        {/* Business Info */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-center space-x-4">
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
              <p className="text-lg text-gray-900">
                {appointmentDetails.startTime} - {appointmentDetails.endTime}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-lg text-gray-900">
                {appointmentDetails.duration} minutes
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-lg text-gray-900">${totalCost}</p>
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Guests ({guests.length})
          </h3>
          <div className="space-y-3">
            {guests.map((guest, index) => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {guest.name?.charAt(0) || index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {guest.name || `Guest ${index + 1}`}
                      {guest.isMainBooker && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Main Booker
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {guest.services?.length || 0} service(s) • $
                      {guest.cost || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You'll receive a confirmation email shortly</li>
            <li>• Please arrive 5-10 minutes before your appointment</li>
            <li>• Bring a valid ID for verification</li>
            <li>• Contact us if you need to reschedule or cancel</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() =>
              (window.location.href = `/v1/${business.businessURL}`)
            }
            className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Back to {business.businessName}
          </button>
          {business.businessDomain && (
            <a
              href={business.businessDomain}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition text-center"
            >
              Visit Website
            </a>
          )}
        </div>

        {/* Auto-redirect notice */}
        <p className="text-center text-sm text-gray-500 mt-4">
          You'll be redirected to the main page in 10 seconds
        </p>
      </div>
    </div>
  );
}
