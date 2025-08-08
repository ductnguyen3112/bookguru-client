"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { updateGuest } from "../redux/slices/groupSlice";
import { setModal, setModalTitle } from "../redux/slices/dataSlice";

export default function GroupServices() {
  const dispatch = useDispatch();

  // ✅ Select only what you need + shallowEqual to avoid extra re-renders
  const businessData   = useSelector((s) => s.data.business, shallowEqual);
  const guests         = useSelector((s) => s.group.guests, shallowEqual);
  const currentGuestId = useSelector((s) => s.group.currentGuest);
  const clientData     = useSelector((s) => s.auth.user, shallowEqual);
  const isAuthenticated= useSelector((s) => s.auth.isAuthenticated);

  const guest = useMemo(
    () => guests?.find((g) => g.id === currentGuestId),
    [guests, currentGuestId]
  );

  const selectedServices = guest?.services || [];
  const categories = businessData?.catalogue || [];

  const [activeCategory, setActiveCategory] = useState("all");

  // Build service lists once
  const allServices = useMemo(() => {
    if (!categories?.length) return [];
    return categories.flatMap((c) => c?.categoryServices || []);
  }, [categories]);

  const currentCategory = useMemo(
    () => (activeCategory !== "all" ? categories.find((c) => c._id === activeCategory) : null),
    [activeCategory, categories]
  );

  const servicesToDisplay = useMemo(
    () => (activeCategory === "all" ? allServices : currentCategory?.categoryServices || []),
    [activeCategory, allServices, currentCategory]
  );

  // Default to "all"
  useEffect(() => {
    if (!activeCategory && categories.length > 0) setActiveCategory("all");
  }, [categories, activeCategory]);

  const openSigninModal = useCallback(() => {
    dispatch(setModal(true));
    dispatch(setModalTitle("ClientPhoneSignin"));
  }, [dispatch]);

  const computeTotals = useCallback((services) => {
    let cost = 0;
    let duration = 0;
    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      cost += Number(s?.price || 0);
      duration += Number(s?.duration || 0);
    }
    return { cost, duration };
  }, []);

  const updateUrlIfNeeded = useCallback((serviceId) => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("serviceId") === serviceId) {
      params.delete("serviceId");
      const qs = params.toString();
      const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const updateServiceSelection = useCallback(
    (updatedServices) => {
      if (!guest) return;

      const { cost, duration } = computeTotals(updatedServices);

      const isMainBooker = guest?.isMainBooker || guest?.id === 1;

      dispatch(
        updateGuest({
          id: guest.id,
          data: {
            name:
              isMainBooker && isAuthenticated
                ? clientData?.clientName || guest?.name || `Guest ${guest.id}`
                : guest?.name || `Guest ${guest.id}`,
            email:
              isMainBooker && isAuthenticated
                ? clientData?.clientEmail || guest?.email || ""
                : guest?.email || "",
            services: updatedServices,
            cost,
            duration,
          },
        })
      );
    },
    [guest, isAuthenticated, clientData, computeTotals, dispatch]
  );

  const handleSelectService = useCallback(
    (service) => {
      if (!guest) return;

      // 🔐 Require sign-in for main booker before allowing mutations
      const isMainBooker = guest?.isMainBooker || guest?.id === 1;
      if (isMainBooker && (!isAuthenticated || !clientData)) {
        openSigninModal();
        return;
      }

      const isSelected = selectedServices.some((s) => s._id === service._id);
      const updatedServices = isSelected
        ? selectedServices.filter((s) => s._id !== service._id)
        : [...selectedServices, service];

      updateServiceSelection(updatedServices);

      // Clean up URL ?serviceId when deselecting same service
      if (isSelected) updateUrlIfNeeded(service._id);
    },
    [guest, isAuthenticated, clientData, selectedServices, updateServiceSelection, openSigninModal, updateUrlIfNeeded]
  );

  if (!guest) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-red-500">No guest selected.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-3">
        <span>Services &gt; Guests &gt; Time &gt; Confirm</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Select services</h1>

      <div className="slide-animated">
        {/* Tabs */}
        <div className="flex space-x-4 overflow-x-auto border-b border-gray-200 mb-6 pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-2 py-1 whitespace-nowrap ${
              activeCategory === "all" ? "border-b-2 border-black font-medium" : "text-gray-500"
            }`}
          >
            All Services
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`px-2 py-1 whitespace-nowrap ${
                activeCategory === cat._id ? "border-b-2 border-black font-medium" : "text-gray-500"
              }`}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {activeCategory === "all" ? "All Services" : currentCategory?.categoryName}
            </h2>

            <div className="space-y-3 overflow-y-auto">
              {servicesToDisplay.map((service) => {
                const isChecked = selectedServices.some((s) => s._id === service._id);

                return (
                  <label
                    key={service._id}
                    className={`block border p-4 rounded-md cursor-pointer hover:bg-gray-50 transition ${
                      isChecked ? "border-black" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="mr-4">
                        <p className="font-medium text-gray-900">{service.serviceName}</p>
                        {service?.description ? (
                          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        ) : null}
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <p className="font-medium text-gray-900">
                          {typeof service.price === "number" ? `$${service.price}` : service.price}
                        </p>
                        <p className="text-sm text-gray-500">
                          {service.duration} mins
                        </p>

                        <input
                          type="checkbox"
                          className="mt-2 h-5 w-5 rounded-full accent-indigo-700"
                          checked={isChecked}
                          onChange={() => handleSelectService(service)}
                          aria-label={`Select ${service.serviceName}`}
                        />
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Optional: summary sidebar can go here */}
        </div>
      </div>
    </div>
  );
}
