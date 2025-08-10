"use client";
import React, { useState } from "react";
import {
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useRouter } from "next/navigation";
import Reschedule from "./Reschedule";
import Cancel from "./Cancel";
import { fetchUserData } from "@/app/redux/slices/authSlice";

const AppointmentDetailsModal = ({
  appointment,
  onClose,
  onCancel,
  onReschedule,
  groupItems = [],
}) => {
  if (!appointment) return null;

  const status = appointment.status;
  const isCanceled = status === "canceled";
  const isPastAppt = moment(appointment.start).isBefore(moment());
  let statusLabel =
    status === "approved" ? "Confirmed" : status === "canceled" ? "Cancelled" : status === "noshow" ? "No Show" : status;
  if (isPastAppt && status === "approved") {
    statusLabel = "Finished";
  }
  const statusBgClass =
    status === "approved"
      ? "bg-green-600"
      : status === "canceled"
      ? "bg-red-600"
      : status === "noshow"
      ? "bg-rose-800"
      : "bg-purple-600";
  const dateLabel = moment(appointment.start).format(
    "ddd, MMM D, YYYY [at] h:mm A"
  );
  const isGroup = Boolean(appointment.groupId) || (groupItems?.length || 0) > 1;
  const mins = Number(appointment.duration || 0);
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  const durationTop = hours
    ? `${hours} hour${hours > 1 ? "s" : ""}${rem ? ` ${rem} min` : ""}`
    : `${rem} min`;
  const items = (groupItems && groupItems.length) ? groupItems : [appointment];
  const firstService = appointment.services?.[0];
  const isUpcoming = appointment.status !== "canceled" && moment(appointment.start).isAfter(moment());
  const showActions = !isGroup && isUpcoming; // hide actions for group bookings
  const serviceDuration = firstService?.duration || mins;
  const sHours = Math.floor(serviceDuration / 60);
  const sRem = serviceDuration % 60;
  const serviceDurationLabel = sHours
    ? `${sHours} hr${sHours > 1 ? "s" : ""}${sRem ? ` ${sRem} min` : ""}`
    : `${serviceDuration} min`;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-stretch justify-center .slide-up">
      <div className="relative bg-white w-full h-screen md:max-w-lg md:h-[90vh] md:mt-8 md:mb-10 md:rounded-2xl rounded-none slide-up shadow-xl flex flex-col">
        {/* Close */}
        <button
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Status pill */}
          <div className={`inline-flex items-center gap-2 ${statusBgClass} text-white px-4 py-2 rounded-full text-sm font-medium`}>
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
              <p className="font-medium text-gray-900">Business</p>
              <p className="text-gray-500">{appointment.location?.business}</p>
            </div>
          </div>

          {/* Overview */}
          <h3 className="mt-8 text-xl font-semibold text-gray-900">Overview</h3>

          {items.length > 1 ? (
            <div className="mt-4 space-y-4">
              {items.map((appt) => (
                <div
                  key={appt._id}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 truncate">
                      {appt.name || "Guest"}
                    </p>
                    <span className="text-gray-500 text-sm">
                      from ${appt.total}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {(appt.services || []).map((svc, idx) => {
                      const d = Number(svc?.duration || 0);
                      const h = Math.floor(d / 60);
                      const m = d % 60;
                      const label = h
                        ? `${h} hr${h > 1 ? "s" : ""}${m ? ` ${m} min` : ""}`
                        : `${m} min`;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-700">
                            {svc?.serviceName || "Service"}
                          </span>
                          <span className="text-gray-500">{label}</span>
                        </div>
                      );
                    })}
                    {(!appt.services || appt.services.length === 0) && (
                      <p className="text-sm text-gray-500">
                        No services listed
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-900">
                    {firstService?.serviceName || "Service"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {serviceDurationLabel}
                  </p>
                </div>
                <div className="text-gray-600">from ${appointment.total}</div>
              </div>
            </div>
          )}

          <hr className="my-6 border-gray-200" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900">Total</p>
            <p className="text-gray-900">
              from ${items.reduce((sum, a) => sum + (Number(a.total) || 0), 0)}
            </p>
          </div>

          {/* Booking ref */}
          {appointment.code && (
            <p className="mt-6 text-gray-400 text-sm">
              Booking ref: {appointment.code}
            </p>
          )}
          {isGroup && (
            <p className="mt-2 inline-flex items-center text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">
              Group booking
            </p>
          )}
          {isGroup && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
              Group appointments can’t be changed online. Please call the salon to make updates.
            </div>
          )}
        </div>

        {/* Fixed footer */}
        {showActions && (
          <div className="p-4 bg-white md:rounded-b-2xl mb-2">
            <div className="grid grid-cols-2 gap-4">
              <button
                className="rounded-lg border border-red-300 text-red-600 font-semibold py-3 hover:bg-red-50"
                onClick={() => onCancel?.(appointment)}
              >
                CANCEL
              </button>
              <button
                className="rounded-lg bg-purple-600 text-white font-semibold py-3 hover:bg-purple-700"
                onClick={() => onReschedule?.(appointment)}
              >
                RESCHEDULE
              </button>
            </div>
          </div>
        )}
        {!showActions && isGroup && (
          <div className="p-4 bg-white md:rounded-b-2xl mb-2">
            <a
              href={appointment?.location?.phone ? `tel:${appointment.location.phone}` : undefined}
              className={`block text-center rounded-lg ${appointment?.location?.phone ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} font-semibold py-3`}
              aria-disabled={!appointment?.location?.phone}
            >
              {appointment?.location?.phone ? `Call Business` : 'Phone number unavailable'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const Appointments = () => {
  const dispatch = useDispatch();
  const { appointments } = useSelector((state) => state.auth);

  const currentTime = moment();
  const router = useRouter();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelAppt, setCancelAppt] = useState(null);
  const [selectedGroupItems, setSelectedGroupItems] = useState([]);

  const canceledAppointments =
    appointments?.filter((a) => a.status === "canceled") || [];
  const activeAppointments =
    appointments?.filter((a) => a.status !== "canceled") || [];
  const upcomingAppointments = activeAppointments.filter((appointment) =>
    moment(appointment.start).isAfter(currentTime)
  );

  const pastAppointments = activeAppointments.filter((appointment) =>
    moment(appointment.start).isBefore(currentTime)
  );
  // Grouping: group items that share the same groupId; singletons use their own _id as key
  const groupByGroupId = (list) => {
    const map = new Map();
    list.forEach((appt) => {
      const key = appt.groupId ? String(appt.groupId) : String(appt._id);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(appt);
    });
    return Array.from(map.values()).map((items) => {
      // choose the earliest start as representative for display
      const sorted = items
        .slice()
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      const rep = sorted[0];
      return {
        key: rep.groupId ? String(rep.groupId) : String(rep._id),
        items: sorted,
        rep,
        isGroup: Boolean(rep.groupId),
      };
    });
  };

  const upcomingGroups = groupByGroupId(upcomingAppointments).sort(
    (a, b) => new Date(a.rep.start) - new Date(b.rep.start)
  );
  const pastGroups = groupByGroupId(pastAppointments).sort(
    (a, b) => new Date(b.rep.start) - new Date(a.rep.start)
  );
  const recentPastGroups = pastGroups.slice(0, 3);
  const canceledGroups = groupByGroupId(canceledAppointments).sort(
    (a, b) => new Date(b.rep.start) - new Date(a.rep.start)
  );

  return (
    <div className="p-6 bg-white min-h-screen relative w-full max-w-3xl mx-auto">
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
        {upcomingGroups?.length > 0 ? (
          upcomingGroups.map(({ key, rep, isGroup, items }) => (
            <div
              key={key}
              className="border border-gray-200 rounded-lg p-4 mb-4 flex items-center cursor-pointer"
              onClick={() => {
                setSelectedAppointment(rep);
                setSelectedGroupItems(items);
              }}
            >
              <img
                src={rep.location.logo}
                alt={rep.location.business}
                className="h-16 w-16 rounded-full mr-4"
              />
              <div>
                <h3 className="text-gray-800 font-semibold">
                  {rep.location.business}
                </h3>
                {isGroup && (
                  <span className="mt-1 inline-flex items-center text-[10px] font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Group ×{items.length}
                  </span>
                )}
                <p className="text-gray-500">
                  {moment(rep.start).format("ddd, MMM D, YYYY [at] h:mm A")}
                </p>
                <p className="text-gray-400">
                  from ${rep.total} • {rep.services.length} item
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

      {/* Past Section (show only 3 most recent) */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Past</h2>
        {recentPastGroups?.length > 0 ? (
          recentPastGroups.map(({ key, rep, isGroup, items }) => (
            <div
              key={key}
              className="border border-gray-200 rounded-lg p-4 mb-4 flex items-center cursor-pointer"
              onClick={() => {
                setSelectedAppointment(rep);
                setSelectedGroupItems(items);
              }}
            >
              <img
                src={rep.location.logo}
                alt={rep.location.business}
                className="h-16 w-16 rounded-full mr-4"
              />
              <div>
                <h3 className="text-gray-800 font-semibold">
                  {rep.location.business}
                </h3>
                {isGroup && (
                  <span className="mt-1 inline-flex items-center text-[10px] font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Group ×{items.length}
                  </span>
                )}
                <p className="text-gray-500">
                  {moment(rep.start).format("ddd, MMM D, YYYY [at] h:mm A")}
                </p>
                <p className="text-gray-400">
                  from ${rep.total} • {rep.services.length} item
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">
              Past appointments will be displayed here.
            </p>
          </div>
        )}
      </div>

      {/* Cancelled Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Cancelled</h2>
        {canceledGroups.length > 0 ? (
          canceledGroups.map(({ key, rep, isGroup, items }) => (
            <div
              key={key}
              className="border border-gray-200 rounded-lg p-4 mb-4 flex items-center"
            >
              <img
                src={rep.location.logo}
                alt={rep.location.business}
                className="h-16 w-16 rounded-full mr-4"
              />
              <div className="flex-1">
                <h3 className="text-gray-800 font-semibold">
                  {rep.location.business}
                </h3>
                {isGroup && (
                  <span className="mt-1 inline-flex items-center text-[10px] font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Group ×{items.length}
                  </span>
                )}
                <p className="text-gray-500">
                  {moment(rep.start).format("ddd, MMM D, YYYY [at] h:mm A")}
                </p>
                <p className="text-gray-400">
                  from ${rep.total} • {rep.services.length} item
                </p>
              </div>
              <span className="ml-4 inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                Cancelled
              </span>
            </div>
          ))
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-500">No cancelled appointments.</p>
          </div>
        )}
      </div>

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          groupItems={selectedGroupItems}
          onClose={() => setSelectedAppointment(null)}
          onCancel={() => {
            // Open Cancel modal
            setCancelAppt(selectedAppointment);
            setCancelOpen(true);
            setSelectedAppointment(null);
            setSelectedGroupItems([]);
          }}
          onReschedule={(appt) => {
            setSelectedAppointment(null);
            setSelectedGroupItems([]);
            setRescheduleAppt(appt || selectedAppointment);
            setRescheduleOpen(true);
          }}
        />
      )}

      {rescheduleOpen && (
        <Reschedule
          open={rescheduleOpen}
          appointment={rescheduleAppt}
          onClose={() => setRescheduleOpen(false)}
          onConfirm={(payload) => {
            setRescheduleOpen(false);
            // Refresh user data to update appointments in auth state
            dispatch(fetchUserData());
          }}
        />
      )}

      {cancelOpen && (
        <Cancel
          open={cancelOpen}
          appointment={cancelAppt}
          onClose={() => setCancelOpen(false)}
          onConfirm={() => {
            setCancelOpen(false);
            // Refresh appointments after cancel
            dispatch(fetchUserData());
          }}
        />
      )}
    </div>
  );
};

export default Appointments;
