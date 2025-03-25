"use client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function SummaryCard() {
  const router = useRouter();
  const { cost, duration, services } = useSelector(
    (state) => state.data.selected
  );
  const business = useSelector((state) => state.data.business);
  const domain = business.businessURL;

  useEffect(() => {
    if (!services.length) {
      const pathname = window.location.pathname;

      if (/\/booking\/[^/]+/.test(pathname)) {
        window.location.href = pathname.replace(/\/booking\/[^/]+/, "/booking");
      }
    }
  }, []);

  // Extract all available services from the business catalogue.
  const availableServices = (business.catalogue || []).reduce(
    (acc, category) => {
      return [...acc, ...(category.categoryServices || [])];
    },
    []
  );

  // Filter selected services to only include those that are available in the business data.
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
      // e.g. when no step is present, go to booking start (adjust URL as needed)

      case "staff":
        router.push(`/v1/${domain}/booking/time`);
        break;
      case "time":
        router.push(`/v1/${domain}/booking/details`);
        break;
      // Add more cases as needed for other steps
      default:
        router.push(`/v1/${domain}/booking/staff`);
        break;
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
            onClick={nextStep}
            className="w-30 lg:w-full bg-black text-white py-3 rounded-md text-sm font-medium hover:bg-black/80 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
