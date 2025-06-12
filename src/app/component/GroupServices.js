"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateGuest } from "../redux/slices/groupSlice";

export default function GroupServices() {
  const dispatch = useDispatch();
  

  const businessData = useSelector((state) => state.data.business);

  const guests = useSelector((state) => state.group.guests);
  const currentGuestId = useSelector((state) => state.group.currentGuest);
  const clientData = useSelector((state) => state.data.clientData.client);


  const guest = guests.find((g) => g.id === currentGuestId);
  const selectedServices = guest?.services || [];

  const categories = businessData?.catalogue || [];
  const [activeCategory, setActiveCategory] = useState("all");

  const allServices = useMemo(() => {
    return categories.flatMap((category) => category.categoryServices || []);
  }, [categories]);

  const currentCategory = useMemo(() => {
    return activeCategory !== "all"
      ? categories.find((cat) => cat._id === activeCategory)
      : null;
  }, [activeCategory, categories]);

  const servicesToDisplay = useMemo(() => {
    return activeCategory === "all"
      ? allServices
      : currentCategory?.categoryServices || [];
  }, [activeCategory, allServices, currentCategory]);

  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory("all");
    }
  }, [categories, activeCategory]);

  const updateServiceSelection = (updatedServices) => {
    if (!guest) {
      console.warn("Guest not found for currentGuestId:", currentGuestId);
      return;
    }

    const totalCost = updatedServices.reduce(
      (acc, s) => acc + Number(s.price),
      0
    );
    const totalDuration = updatedServices.reduce(
      (acc, s) => acc + Number(s.duration),
      0
    );

    // if guest is > 1 then create a new guest objec

    dispatch(
      updateGuest({
        id: currentGuestId,
        data: {
          name: guest.isMainBooker
            ? clientData.clientName
            : guest.name || `Guest ${guest.id}`,
          email: guest.isMainBooker
            ? clientData.clientEmail
            : guest.email || "",
          services: updatedServices,
          cost: totalCost,
          duration: totalDuration,
        },
      })
    );
  };

  const handleSelectService = (service) => {
    const isSelected = selectedServices.some((s) => s._id === service._id);
    const updatedServices = isSelected
      ? selectedServices.filter((s) => s._id !== service._id)
      : [...selectedServices, service];

    updateServiceSelection(updatedServices);

    if (isSelected) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("serviceId") === service._id) {
        params.delete("serviceId");
        const newUrl = `${window.location.pathname}${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        window.history.replaceState({}, "", newUrl);
      }
    }
  };

  if (!guest) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-red-500">No guest selected.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 ">
      <nav className="text-sm text-gray-500 mb-3">
        <span>Services &gt; Guests &gt; Time &gt; Confirm</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Select services</h1>
      <div className="slide-animated"> 
      <div className="flex space-x-4 overflow-x-auto border-b border-gray-200 mb-6 pb-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-2 py-1 whitespace-nowrap ${
            activeCategory === "all"
              ? "border-b-2 border-black font-medium"
              : "text-gray-500"
          }`}
        >
          All Services
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-2 py-1 whitespace-nowrap ${
              activeCategory === cat._id
                ? "border-b-2 border-black font-medium"
                : "text-gray-500"
            }`}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {activeCategory === "all"
              ? "All Services"
              : currentCategory?.categoryName}
          </h2>

          <div className="space-y-3 overflow-y-auto">
            {servicesToDisplay.map((service) => {
              const isChecked = selectedServices.some(
                (s) => s._id === service._id
              );
              return (
                <label
                  key={service._id}
                  className={`block border p-4 rounded-md cursor-pointer hover:bg-gray-50 transition ${
                    isChecked ? "border-black" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="mr-4">
                      <p className="font-medium text-gray-900">
                        {service.serviceName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {service.description}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-medium text-gray-900">
                        ${service.price}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.duration} mins
                      </p>
                      <input
                        type="checkbox"
                        className="mt-2 h-5 w-5 rounded-lg accent-indigo-700"
                        checked={isChecked}
                        onChange={() => handleSelectService(service)}
                      />
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
