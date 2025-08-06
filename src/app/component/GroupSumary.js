"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

import { setModal, setModalTitle } from "../redux/slices/dataSlice";

export default function GroupSummary() {
  const dispatch = useDispatch();
  const router = useRouter();

  const guests = useSelector((state) => state.group.guests);
  const date = useSelector((state) => state.group.date);
  const time = useSelector((state) => state.group.time);
  const clientPhone = useSelector((state) => state.group.clientPhone);
  const business = useSelector((state) => state.data.business);
  const clientData = useSelector((state) => state.data.clientData.client);

  const domain = business.businessURL;
  const [buttonValue, setButtonValue] = useState("Continue");

  // ✅ Memoize computed values to prevent unnecessary re-calculations
  const { mainBooker, services, cost, duration, staff } = useMemo(() => {
    const mainBooker = guests.find((g) => g.isMainBooker);
    return {
      mainBooker,
      services: mainBooker?.services || [],
      cost: mainBooker?.cost || 0,
      duration: mainBooker?.duration || 0,
      staff: mainBooker?.staff || "any",
    };
  }, [guests]);



  // ✅ Memoize filtered services to prevent re-computation
  const { filteredServices, servicesCount, durationString } = useMemo(() => {
    const availableServices = (business.catalogue || []).flatMap(
      (category) => category.categoryServices || []
    );

    const filteredServices = services.filter((selectedService) =>
      availableServices.some(
        (availableService) =>
          availableService._id.toString() === selectedService._id.toString()
      )
    );

    const servicesCount = filteredServices.length;
    const durationString =
      duration < 60
        ? `${duration}m`
        : `${Math.floor(duration / 60)}h${
            duration % 60 ? ` ${duration % 60}m` : ""
          }`;

    return { filteredServices, servicesCount, durationString };
  }, [services, business.catalogue, duration]);

  // ✅ Stable start and end times
  const { start, end } = useMemo(() => {
    if (!time || !duration) return { start: null, end: null };
    const start = new Date(time);
    const end = new Date(start.getTime() + duration * 60000);
    return { start, end };
  }, [time, duration]);

  useEffect(() => {
    if (!services.length) {
      const pathname = window.location.pathname;
      if (/\/group\//.test(pathname)) {
        window.location.href = pathname.replace(/\/group\/[^/]+/, "/group");
      }
    }
  }, [services.length]); // ✅ Only depend on services.length, not the entire services array

  // ✅ Prepare group appointment payload
  const groupAppointmentPayload = useMemo(() => {
    if (!time || !guests.length) return null;

    // Calculate group duration (longest service duration)
    const groupDuration = Math.max(...guests.map(g => g.duration || 0));
    const groupStart = new Date(time);
    const groupEnd = new Date(groupStart.getTime() + groupDuration * 60000);

    // Prepare services and preferences by guest
    const servicesByGuest = {};
    const preferenceByGuest = {};

    guests.forEach(guest => {
      servicesByGuest[guest.id] = guest.services || [];
      preferenceByGuest[guest.id] = guest.staff !== "any";
    });

    return {
      url: domain,
      guests: guests.map(guest => ({
        id: guest.id,
        userId: guest.isMainBooker ? clientData._id : null,
        staffId: guest.staff === "any" ? null : guest.staff,
        total: guest.cost || 0,
        duration: guest.duration || 0,
      })),
      groupStart: groupStart.toISOString(),
      groupEnd: groupEnd.toISOString(),
      groupDuration,
      note: "", // You can add note input later
      servicesByGuest,
      preferenceByGuest,
    };
  }, [time, guests, domain, clientData._id]);

  const SubmitAppointment = useCallback(async () => {
    if (!groupAppointmentPayload) {
      toast.error("Invalid appointment data");
      return;
    }

    try {
      const response = await axios.post(
        "/api/group/add-appointment",
        groupAppointmentPayload
      );

      if (response.data.success) {
        toast.success("Group appointment created successfully!");
        router.push(`/v1/${domain}/group/confirm`);
      } else {
        throw new Error(response.data.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error("Group appointment error:", error);
      setButtonValue("Continue");
      toast.error(error.response?.data?.message || "Something went wrong, please try again");
    }
  }, [groupAppointmentPayload, router, domain]);

  const nextStep = useCallback((e) => {
    e.preventDefault();

    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');
    const mainStep = pathSegments[pathSegments.length - 1];

    switch (mainStep) {
      case "guests":
        router.push(`/v1/${domain}/group/staff`);
        break;
        
      case "staff":
        // Validate that we have at least 2 guests with services
        const validGuests = guests.filter(g => g.services?.length > 0);
        if (validGuests.length < 2) {
          toast.error("Please add at least 2 guests with services.");
          return;
        }
        router.push(`/v1/${domain}/group/time`);
        break;
        
      case "time":
        if (!time) {
          toast.error("Please select a time for the group appointment.");
          return;
        }
        router.push(`/v1/${domain}/group/overview`);
        break;
        
      case "overview":
        setButtonValue("Processing...");
        const token = localStorage.getItem("token");
        
        if (!token || token === "null" || token === "undefined") {
          setButtonValue("Continue");
          dispatch(setModal(true));
          dispatch(setModalTitle("ClientPhoneSignin"));
          return;
        }
        
        SubmitAppointment();
        break;
        
      default:
        // Default case - go to services selection
        const token2 = localStorage.getItem("token");
        if (!token2 || token2 === "null" || token2 === "undefined") {
          dispatch(setModal(true));
          dispatch(setModalTitle("ClientPhoneSignin"));
          return;
        }
        router.push(`/v1/${domain}/group/guests`);
        break;
    }
  }, [router, domain, guests, time, dispatch, SubmitAppointment]);

  return (
    <div className="fixed bottom-0 left-0 right-0 md:sticky md:top-5 block">
      <div className="border bg-white md:mt-20 border-gray-200 rounded-md p-4 justify-between lg:min-h-80">
        <div className="hidden md:block">
          <div className="flex items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {business.businessName}
              </h3>
              <p className="text-sm text-gray-500">
                {business.businessAddress}
              </p>
            </div>
          </div>

          <div className="border-y border-gray-200 py-3 mb-4">
            {filteredServices.map((service, index) => (
              <div key={`${service._id}-${index}`} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">
                    {service.serviceName}
                  </p>
                  <p className="font-medium text-gray-900">${service.price}</p>
                </div>
                <p className="text-sm text-gray-500">{service.duration} mins</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-700">Total</p>
            <p className="text-sm font-semibold text-gray-900">CA ${cost}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="block md:hidden">
            <p className="text-lg font-semibold">${cost}</p>
            <p className="text-sm text-black">
              Services: {servicesCount} - {durationString}
            </p>
          </div>
          <button
            onClick={nextStep}
            className="w-30 lg:w-full bg-gray-800 text-white py-3 cursor-pointer rounded-full text-sm font-medium hover:bg-gray-700 transition"
          >
            {buttonValue}
          </button>
        </div>
      </div>
    </div>
  );
}