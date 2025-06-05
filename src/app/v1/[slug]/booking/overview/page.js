"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNote } from "@/app/redux/slices/dataSlice";
import moment from "moment-timezone";

const Page = () => {
  const dispatch = useDispatch();

  const {
    time,
    staffs,
    services = [],
    cost,
    note,
  } = useSelector((state) => state.data.selected);

  const business = useSelector((state) => state.data.business);

  // 🧠 Flatten all services from the catalogue
  const allServices =
    business?.catalogue?.flatMap((cat) => cat.categoryServices) || [];

  // 🔍 Match selected service IDs to full service objects
  const selectedServices = allServices.filter((service) =>
    services.includes(service._id)
  );

  if (!business) return null;

  return (
    <div className="w-full mx-auto md:p-10 p-4">
      {/* Breadcrumb or step indicator */}
      <nav className="text-sm text-gray-500 mb-3">
        <span>Services &gt; Professional &gt; Time &gt; Confirm</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6">Appointment Overview</h1>
      <div className="flex items-center space-x-4">
        <img
          src={business.businessLogo} // replace with your image URL or dynamic logo
          alt="Business Logo"
          className="w-12 h-12 rounded-md object-cover"
        />
        <div>
          <h2 className="text-base font-semibold text-black">
            {business.businessName}
          </h2>
          <p className="text-sm text-gray-500">
            {business.businessAddress} {business.businessCity}{" "}
          </p>
        </div>
      </div>

      <dl className="space-y-4 mt-5">
        <div className="flex items-center justify-between border-t border-stroke pt-4">
          {time && business?.businessTimezone ? (
            <>
              <dt className="text-base font-medium text-gray-900">
                {moment
                  .tz(time, business.businessTimezone)
                  .format("dddd, MMMM D, YYYY")}
              </dt>
              <dd className="text-base font-medium text-gray-900">
                {moment.tz(time, business.businessTimezone).format("hh:mm A")}
              </dd>
            </>
          ) : null}
        </div>

        {staffs && typeof staffs === "object" && (
          <div className="flex items-center justify-between border-t border-stroke pt-4">
            <dt className="text-base font-medium text-gray-900">
              {staffs.staffName}
            </dt>
            <dd className="text-base font-medium text-gray-900">
              {staffs.staffProfession}
            </dd>
          </div>
        )}

        {selectedServices.map((service, index) => (
          <div className="flex items-center space-x-4">
            <div
              key={index}
              className="flex items-center justify-between border-t border-stroke pt-4"
            >
              <dt className="text-base font-medium text-gray-900">
                {index + 1}. {service.serviceName}
              </dt>
              <dd className="text-base font-medium text-gray-900">
                ${service.price}
                {service.flex ? "+" : ""}
              </dd>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="text-base font-medium text-gray-900">Total</dt>
          <dd className="text-base font-medium text-gray-900">${cost}</dd>
        </div>

        <p className="text-center text-sm">
          The total price may vary based on the service offered at the store.
        </p>
      </dl>

      <div className="mb-4 mt-6">
        <label className="block text-black text-lg font-bold mb-3">
          Payment method
        </label>
        <button
          onClick={(e) => e.preventDefault()}
          className="bg-white text-black border border-strokedark rounded-lg py-3 px-4 w-full"
        >
          Pay In Store
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-black text-lg font-bold mb-2">
          Booking notes
        </label>
        <textarea
          rows={5}
          className="shadow border rounded-lg w-full py-2 px-3 text-gray-700"
          value={note}
          onChange={(e) => dispatch(addNote(e.target.value))}
          placeholder="Include comments or requests about your booking"
        />
      </div>

      <div className="mb-4">
        <label className="block text-black text-lg font-bold mb-2">
          Cancellation policy
        </label>
        <p className="text-gray-600 text-sm">
          Please avoid cancelling within 30 minutes of your appointment time.
        </p>
      </div>
    </div>
  );
};

export default Page;
