"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNote } from "@/app/redux/slices/dataSlice";
import moment from "moment-timezone";
import { UserIcon, ClockIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

export default function AppointmentOverview() {
  const dispatch = useDispatch();
  const {
    time,
    staff, // staff ID
    services = [],
    cost,
    note,
    preference
  } = useSelector((state) => state.data.selected);
  const business = useSelector((state) => state.data.business);

  const [appointmentDetails, setAppointmentDetails] = useState(null);

  // Find staff object by ID
  const staffMember = business?.staffs?.find((s) => s._id === staff) || {};

  // Flatten all services
  const allServices = business?.catalogue?.flatMap((cat) => cat.categoryServices) || [];
  const selectedServices = allServices.filter((service) => services.includes(service._id));

  // Compute appointment date & time
  useEffect(() => {
    if (time && business?.businessTimezone) {
      const start = moment(time).tz(business.businessTimezone);
      setAppointmentDetails({
        date: start.format("MMMM DD, YYYY"),
        time: start.format("h:mm A"),
      });
    }
  }, [time, business]);

  if (!appointmentDetails || !business) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 lg:mt-6 ">
      <div className="max-w-2xl w-full bg-white rounded-xl border  border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Overview</h1>
          <p className="text-gray-600">Review your appointment details before confirming</p>
        </div>

        {/* Business Info */}
        <div className="border-b border-gray-200 pb-6 mb-6 flex items-center space-x-4">
          {business.businessLogo ? (
            <img
              src={business.businessLogo}
              alt={business.businessName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 font-medium">{business.businessName.charAt(0)}</span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{business.businessName}</h2>
            <p className="text-gray-600">{business.businessAddress}</p>
            <a href={`tel:${business.businessPhone}`} className="text-blue-600 hover:underline">
              {business.businessPhone}
            </a>
          </div>
        </div>

        {/* Details Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <UserIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {preference === false ? 'Any' : staffMember.staffName || '—'}
            </div>
            <div className="text-sm text-blue-800">Staff</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <ClockIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{appointmentDetails.time}</div>
            <div className="text-sm text-green-800">Time</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">${cost}</div>
            <div className="text-sm text-purple-800">Total</div>
          </div>
        </div>

        {/* Services List */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
          <ul className="space-y-3">
            {selectedServices.map((svc, idx) => (
              <li key={svc._id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span>{idx + 1}. {svc.serviceName}</span>
                <span>${svc.price}{svc.flex ? '+' : ''}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notes & Policy */}
        <div className="mb-4">
          <label className="block text-gray-900 font-semibold mb-2">Booking Notes</label>
          <textarea
            rows={4}
            className="shadow border rounded-lg w-full py-2 px-3 text-gray-700"
            value={note}
            onChange={(e) => dispatch(addNote(e.target.value))}
            placeholder="Include comments or requests about your booking"
          />
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Please avoid cancelling within 30 minutes of your appointment time.
          </p>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Questions? Call us at{' '}
            <a href={`tel:${business.businessPhone}`} className="text-blue-600 hover:underline">
              {business.businessPhone}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
