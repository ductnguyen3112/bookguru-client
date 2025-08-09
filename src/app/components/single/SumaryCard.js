"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import { setModal, setModalTitle, addStaff } from "../../redux/slices/dataSlice";

const SummaryCard = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    cost,
    duration,
    staff,
    services,
    note,
    preference,
    time,
    randomStaff,
  } = useSelector((state) => state.data.selected);

  const clientData = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const business = useSelector((state) => state.data.business);
  const domain = business.businessURL;

  const [buttonValue, setButtonValue] = useState("Continue");

  const start = new Date(time);
  const end = new Date(start.getTime() + duration * 60000);

  useEffect(() => {
    if (!services.length) {
      const pathname = window.location.pathname;
      if (/\/booking\/[^/]+/.test(pathname)) {
        window.location.href = pathname.replace(/\/booking\/[^/]+/, "/booking");
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

  const handleNextStep = (e) => {
    e.preventDefault();
    const mainStep = window.location.href.split("/").pop().split("#")[0];

    switch (mainStep) {
      case "staff":
        if (!preference) {
          dispatch(addStaff(randomStaff));
        }
        router.push(`/v1/${domain}/booking/time`);
        break;
      case "time":
        if (!time) {
          toast.error("Please select a time");
          return;
        }
        router.push(`/v1/${domain}/booking/overview`);
        break;
      case "overview":
        setButtonValue("Processing...");
        if (!isAuthenticated || !clientData) {
          dispatch(setModal(true));
          dispatch(setModalTitle("ClientPhoneSignin"));
          return;
        }
        submitAppointment();
        break;
      default:
        router.push(`/v1/${domain}/booking/staff`);
        break;
    }
  };

  const submitAppointment = async () => {
    try {
      const appointment = {
        url: domain,
        servicesId: services,
        userId: clientData._id,
        staff,
        total: cost,
        note,
        start: start.toISOString(),
        end: end.toISOString(),
        preference,
        duration,
        status: "approved",
      };

      await axios.post("/api/client/appointment/add", appointment);
      router.push(`/v1/${domain}/confirm`);
    } catch (error) {
      console.error(error);
      router.push(`/v1/${domain}`);
      setButtonValue("Continue");
      toast.error("Something went wrong, please try again");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:sticky md:top-5 block">
      <div className="border bg-white md:mt-20 border-gray-200 rounded-md p-4 justify-between lg:min-h-80">
        {/* Header: Business Info */}
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

          {/* Selected Services */}
          <div className="border-y border-gray-200 py-3 mb-4">
            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">
                      {service.serviceName}
                    </p>
                    <p className="font-medium text-gray-900">${service.price}</p>
                  </div>
                  <p className="text-sm text-gray-500">{service.duration} mins</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No service selected</p>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-700">Total</p>
            <p className="text-sm font-semibold text-gray-900">CA ${cost}</p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-between items-center">
          {/* Mobile view */}
          <div className="block md:hidden">
            <p className="text-lg font-semibold">{`$${cost}`}</p>
            <p className="text-sm text-black">
              {`Services: ${servicesCount || 0} - ${durationString}`}
            </p>
          </div>
          <button
            onClick={handleNextStep}
            className="w-30 lg:w-full bg-gray-800 text-white py-3 cursor-pointer rounded-full text-sm font-medium hover:bg-gray-700 transition"
          >
            {buttonValue}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
