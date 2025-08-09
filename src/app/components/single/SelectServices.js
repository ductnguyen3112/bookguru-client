"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addServices, addCost, addDuration, addStaffs } from "../../redux/slices/dataSlice";
export default function SelectServices() {
  const dispatch = useDispatch();

  // Redux data
  const businessData = useSelector((state) => state.data.business);
  const selectedData = useSelector((state) => state.data.selected);
  const selectedServices = selectedData.services;

  const categories = businessData?.catalogue || [];

  const [activeCategory, setActiveCategory] = useState("all");

  // All services memoized
  const allServices = useMemo(() => {
    return categories.flatMap((category) => category.categoryServices || []);
  }, [categories]);

  // Current category
  const currentCategory = useMemo(() => {
    return activeCategory !== "all"
      ? categories.find((cat) => cat._id === activeCategory)
      : null;
  }, [activeCategory, categories]);

  // Services to show based on tab
  const servicesToDisplay = useMemo(() => {
    return activeCategory === "all"
      ? allServices
      : currentCategory?.categoryServices || [];
  }, [activeCategory, allServices, currentCategory]);

  // Set default tab on data load
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory("all");
    }
  }, [categories, activeCategory]);

  const updateServiceTotals = (services) => {
    dispatch(addServices(services));
    dispatch(
      addCost(services?.reduce((acc, s) => acc + Number(s.price), 0))
    );
    dispatch(
      addDuration(services?.reduce((acc, s) => acc + Number(s.duration), 0))
    );
  };

  const handleSelectService = (service) => {
    const isSelected = selectedServices.some((s) => s._id === service._id);
    let updatedServices = isSelected
      ? selectedServices.filter((s) => s._id !== service._id)
      : [...selectedServices, service];

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

    updateServiceTotals(updatedServices);
  };

  // Staff intersection logic
  useEffect(() => {
    if (selectedServices.length > 0) {
      const staffLists = selectedServices.map((s) => s.staff || []);
      const commonStaff = staffLists.reduce((acc, list) =>
        acc.filter((id) => list.includes(id))
      );

      const businessStaffIds = (businessData?.staffs || []).map((s) => s._id);
      const validStaff = commonStaff.filter((id) =>
        businessStaffIds.includes(id)
      );

      dispatch(addStaffs(validStaff));
    } else {
      dispatch(addStaffs([]));
    }
  }, [selectedServices, businessData, dispatch]);

  // Auto add service from query
  useEffect(() => {
    if (!businessData) return;
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get("serviceId");
    if (serviceId) {
      const serviceToAdd = allServices.find((s) => s._id === serviceId);
      if (serviceToAdd && !selectedServices.some((s) => s._id === serviceId)) {
        const updatedServices = [...selectedServices, serviceToAdd];
        updateServiceTotals(updatedServices);
      }
    }
  }, [businessData, allServices, selectedServices]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 slide-animated">
      <nav className="text-sm text-gray-500 mb-3">
        <span>Services &gt; Professional &gt; Time &gt; Confirm</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Select services</h1>

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
            {servicesToDisplay?.map((service) => {
              const isChecked = selectedServices.some(
                (s) => s._id === service._id
              );
              return (
                <label
                  key={service._id}
                  className={`block border p-4 rounded-lg cursor-pointer hover:bg-gray-50 slide-animated transition ${
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
                        name="service"
                      
                        className="mt-2 h-5 w-5 rounded-full border-gray-300 accent-indigo-600 focus:ring-indigo-500"
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
  );
}
