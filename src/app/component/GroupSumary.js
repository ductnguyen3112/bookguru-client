"use client";

import React, { useEffect, useState } from "react";
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

  const mainBooker = guests.find((g) => g.isMainBooker);
  const services = mainBooker?.services || [];
  const cost = mainBooker?.cost || 0;
  const duration = mainBooker?.duration || 0;
  const staff = mainBooker?.staff || "any";

  const start = new Date(time);
  const end = new Date(start.getTime() + duration * 60000);

  useEffect(() => {
    if (!services.length) {
      const pathname = window.location.pathname;
      if (/\/group\//.test(pathname)) {
        window.location.href = pathname.replace(/\/group\/[^/]+/, "/group");
      }
    }
  }, [services]);

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

  const nextStep = (e) => {
    e.preventDefault();

    const mainStep = window.location.href.split("/").pop().split("#")[0];

    switch (mainStep) {
      case "guests":
        router.push(`/v1/${domain}/group/staff`);
        break;
      case "staff":
        if (guests.length === 1) {
          toast.error("Please add at least 2 guest.");
          return;
        }
        
       router.push(`/v1/${domain}/group/time`);
        break;
      case "overview":
        setButtonValue("Processing...");

        if (!token || token === "null" || token === "undefined") {
          dispatch(setModal(true));
          dispatch(setModalTitle("ClientPhoneSignin"));
          return;
        } else {
          SubmitAppointment();
        }
        break;
      default:
        const token = localStorage.getItem("token");

        if (!token || token === "null" || token === "undefined") {
          dispatch(setModal(true));
          dispatch(setModalTitle("ClientPhoneSignin"));
          return;
        }
        router.push(`/v1/${domain}/group/guests`);
        break;
    }
  };

  const SubmitAppointment = async () => {
    try {
      const appointment = {
        url: domain,
        servicesId: services,
        userId: clientData._id,
        staff: staff,
        total: cost,
        note: "",
        start: start.toISOString(),
        end: end.toISOString(),
        preference: false,
        duration,
        status: "approved",
      };

      const response = await axios.post(
        "/api/client/appointment/add",
        appointment
      );
      router.push(`/v1/${domain}/group/confirm`);
    } catch (error) {
      console.error(error);
      router.push(`/v1/${domain}/group`);
      setButtonValue("Continue");
      toast.error("Something went wrong, please try again");
    }
  };

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
              <div key={index} className="mb-3 last:mb-0">
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
            className="w-30 lg:w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-black/80 transition"
          >
            {buttonValue}
          </button>
        </div>
      </div>
    </div>
  );
}
