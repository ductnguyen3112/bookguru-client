"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addServices, addCost, addDuration } from "../redux/slices/dataSlice";

export default function SelectServices() {
  // Get business data and selected data from Redux
  const businessData = useSelector((state) => state.data.business);
  const selectedData = useSelector((state) => state.data.selected);
  const selectedServices = selectedData.services;

  // Initialize dispatch
  const dispatch = useDispatch();

  // Use the catalogue from businessData as categories (fallback to an empty array)
  const categories = businessData?.catalogue || [];

  // Track the active category ("all" by default)
  const [activeCategory, setActiveCategory] = useState("all");

  // Set default active category when businessData is available
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory("all");
    }
  }, [categories, activeCategory]);

  // Get the current category if one is selected
  const currentCategory =
    activeCategory !== "all"
      ? categories.find((cat) => cat._id === activeCategory)
      : null;

  // Aggregate all services from all categories for the "All Services" tab
  const allServices = categories.reduce((acc, category) => {
    return category.categoryServices
      ? [...acc, ...category.categoryServices]
      : acc;
  }, []);

  // Determine which services to display based on the active tab
  const servicesToDisplay =
    activeCategory === "all" ? allServices : currentCategory?.categoryServices;

  // Handle category (tab) change
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Toggle service selection and update cost/duration in Redux
  const handleSelectService = (service) => {
    const isSelected = selectedServices.some((s) => s._id === service._id);
    let updatedServices;
    if (isSelected) {
      // Remove service if already selected
      updatedServices = selectedServices.filter((s) => s._id !== service._id);
      // If the URL contains this serviceId, remove it from the query string
      const params = new URLSearchParams(window.location.search);
      if (params.get("serviceId") === service._id) {
        params.delete("serviceId");
        const newUrl = `${window.location.pathname}${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        window.history.replaceState({}, "", newUrl);
      }
    } else {
      // Add service to the array
      updatedServices = [...selectedServices, service];
    }
    dispatch(addServices(updatedServices));
    dispatch(
      addCost(updatedServices.reduce((acc, s) => acc + Number(s.price), 0))
    );
    dispatch(
      addDuration(
        updatedServices.reduce((acc, s) => acc + Number(s.duration), 0)
      )
    );
  };

  // Automatically add service from query parameter if present
  useEffect(() => {
    if (!businessData) return; // wait for business data
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get("serviceId");
    if (serviceId) {
      const serviceToAdd = allServices.find((s) => s._id === serviceId);
      if (serviceToAdd && !selectedServices.some((s) => s._id === serviceId)) {
        const updatedServices = [...selectedServices, serviceToAdd];
        dispatch(addServices(updatedServices));
        dispatch(
          addCost(updatedServices.reduce((acc, s) => acc + Number(s.price), 0))
        );
        dispatch(
          addDuration(
            updatedServices.reduce((acc, s) => acc + Number(s.duration), 0)
          )
        );
      }
    }
  }, [businessData, allServices, selectedServices, dispatch]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 slide-animated">
      {/* Breadcrumb or step indicator */}
      <nav className="text-sm text-gray-500 mb-3">
        <span>Services &gt; Professional &gt; Time &gt; Confirm</span>
      </nav>

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6 ">Select services</h1>

      {/* Category Tabs */}
      <div className="flex space-x-4 overflow-x-auto border-b border-gray-200 mb-6 pb-2 ">
        <button
          onClick={() => handleCategoryClick("all")}
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
            onClick={() => handleCategoryClick(cat._id)}
            className={`px-2 py-1 whitespace-nowrap ${
              activeCategory === cat._id
                ? "border-b-2 border-black font-medium"
                : "text-gray-500 "
            }`}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      {/* Main grid: Left = services, Right = summary (if needed) */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
        {/* Left Column: Service List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 ">
            {activeCategory === "all"
              ? "All Services"
              : currentCategory?.categoryName}
          </h2>

          {/* Service Cards with scrolling */}
          <div className="space-y-3 overflow-y-auto">
            {servicesToDisplay?.map((service) => {
              const isChecked = selectedServices.some(
                (s) => s._id === service._id
              );
              return (
                <label
                  key={service._id}
                  className={`block border p-4 rounded-md cursor-pointer hover:bg-gray-50 slide-animated transition ${
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
  );
}
