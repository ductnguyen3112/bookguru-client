'use client'
import React, { useState } from "react";
import { CalendarIcon, XMarkIcon, CheckCircleIcon ,MapPinIcon,BuildingStorefrontIcon} from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import moment from "moment";
import { useRouter } from "next/navigation";

const AppointmentDetailsModal = ({ appointment, onClose }) => {
  if (!appointment) return null;

  const statusLabel = appointment.status === "approved" ? "Confirmed" : appointment.status;
  const dateLabel = moment(appointment.start).format("ddd, MMM D, YYYY [at] h:mm A");
  const mins = Number(appointment.duration || 0);
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  const durationTop = hours
    ? `${hours} hour${hours > 1 ? "s" : ""}${rem ? ` ${rem} min` : ""}`
    : `${rem} min`;
  const firstService = appointment.services?.[0];
  const serviceDuration = firstService?.duration || mins;
  const sHours = Math.floor(serviceDuration / 60);
  const sRem = serviceDuration % 60;
  const serviceDurationLabel = sHours
    ? `${sHours} hr${sHours > 1 ? "s" : ""}${sRem ? ` ${sRem} min` : ""}`
    : `${serviceDuration} min`;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 slide-up flex items-stretch justify-center .slide-up">
      <div className="relative bg-white w-full h-screen md:max-w-lg md:h-[90vh]  md:mt-8 md:mb-10 md:rounded-2xl rounded-none shadow-xl overflow-y-auto">
        {/* Close */}
        <button
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircleIcon className="h-5 w-5 text-white" />
            {statusLabel}
          </div>

          {/* Big date */}
          <h2 className="mt-4 text-3xl font-bold text-gray-900">{dateLabel}</h2>
          <p className="mt-2 text-gray-500 text-sm">{durationTop} duration</p>

          {/* Getting there */}
          <div className="mt-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <MapPinIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Direction</p>
              <p className="text-gray-500">{appointment.location?.address}</p>
            </div>
          </div>
          <hr className="my-6 border-gray-200" />

          {/* Venue details */}
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
             Business</p>
              <p className="text-gray-500">{appointment.location?.business}</p>
            </div>
          </div>

          {/* Overview */}
          <h3 className="mt-8 text-xl font-semibold text-gray-900">Overview</h3>

          {/* Service row */}
          <div className="mt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-900">{firstService?.serviceName || "Service"}</p>
                <p className="text-gray-500 text-sm">{serviceDurationLabel}</p>
              </div>
              <div className="text-gray-600">from ${appointment.total}</div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900">Total</p>
            <p className="text-gray-900">from ${appointment.total}</p>
          </div>

          {/* Booking ref */}
          {appointment.code && (
            <p className="mt-6 text-gray-400 text-sm">Booking ref: {appointment.code}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Appointments = () => {
  const { appointments } = useSelector((state) => state.auth);
  const currentTime = moment();
  const router = useRouter();
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const upcomingAppointments = appointments?.filter((appointment) =>
    moment(appointment.start).isAfter(currentTime)
  );

  const pastAppointments = appointments?.filter((appointment) =>
    moment(appointment.start).isBefore(currentTime)
  );

  return (
    <div className="p-6 bg-white min-h-screen relative ">
      <button
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-200"
        onClick={() => router.push("/client")}
      >
        <XMarkIcon className="h-6 w-6 text-gray-600" />
      </button>

      <h1 className="text-2xl font-bold mb-4">Appointments</h1>

      {/* Upcoming Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Upcoming</h2>
        {upcomingAppointments?.length > 0 ? (
          upcomingAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="border border-gray-200 rounded-lg p-4 mb-4 flex items-center cursor-pointer"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <img
                src={appointment.location.logo}
                alt={appointment.location.business}
                className="h-16 w-16 rounded-lg mr-4"
              />
              <div>
                <h3 className="text-gray-800 font-semibold">
                  {appointment.location.business}
                </h3>
                <p className="text-gray-500">
                  {moment(appointment.start).format("ddd, MMM D, YYYY [at] h:mm A")}
                </p>
                <p className="text-gray-400">
                  from ${appointment.total} • {appointment.services.length} item
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <CalendarIcon className="h-12 w-12 text-purple-500 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">No upcoming appointments</p>
            <p className="text-gray-400 mb-4">
              Your upcoming appointments will appear here when you book
            </p>
            {/* <button className="bg-purple-500 text-white px-4 py-2 rounded-lg">
              Search salons
            </button> */}
          </div>
        )}
      </div>

      {/* Past Section */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Past</h2>
        {pastAppointments?.length > 0 ? (
          pastAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="border border-gray-200 rounded-lg p-4 mb-4 flex items-center cursor-pointer"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <img
                src={appointment.location.logo}
                alt={appointment.location.business}
                className="h-16 w-16 rounded-full mr-4"
              />
              <div>
                <h3 className="text-gray-800 font-semibold">
                  {appointment.location.business}
                </h3>
                <p className="text-gray-500">
                  {moment(appointment.start).format("ddd, MMM D, YYYY [at] h:mm A")}
                </p>
                <p className="text-gray-400">
                  from ${appointment.total} • {appointment.services.length} item
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">Past appointments will be displayed here.</p>
          </div>
        )}
      </div>

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};

export default Appointments;