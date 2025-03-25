"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { addStaff } from "@/app/redux/slices/dataSlice";

export default function StaffSelection() {
  const dispatch = useDispatch();

  const selectedData = useSelector((state) => state.data.selected);
  const selectedStaff = selectedData.staffs;
  const business = useSelector((state) => state.data.business);

  // selectedData.services is an array of service objects
  const selectedServiceObjects = selectedData?.services || [];
  useEffect(() => {
    if (!selectedServiceObjects.length) {
      const pathname = window.location.pathname;

      if (/\/booking\/[^/]+/.test(pathname)) {
        window.location.href = pathname.replace(/\/booking\/[^/]+/, "/booking");
      }
    }
  }, []);

  if (!selectedData.services.length) {
    return null;
  }

  // Map business staffs into a consistent object with "id" and "staffName"
  const staffMembers = useMemo(() => {
    return (business?.staffs || []).map((staff) => ({
      id: staff._id, // using _id from your staff model
      staffName: staff.staffName,
      note: staff.staffNote, // if needed
      // add any other fields if necessary
    }));
  }, [business]);

  // Get catalogue from business
  const catalogue = business?.catalogue || [];

  // Build available staff IDs by computing the intersection of staff lists
  // for each selected service. This way, only staff that do every selected
  // service will be available.
  const availableStaffIds = useMemo(() => {
    // Create an array of staff arrays for each selected service.
    const serviceStaffLists = selectedServiceObjects.map((selectedService) => {
      // For each service, search the catalogue to find the matching service object.
      // We assume each service appears in one of the categories.
      let serviceObj;
      for (const category of catalogue) {
        serviceObj = (category.categoryServices || []).find(
          (service) => service._id === selectedService._id
        );
        if (serviceObj) break;
      }
      // Return its staff array (or empty array if not found).
      return serviceObj ? serviceObj.staff || [] : [];
    });

    // If no services are selected, return an empty array.
    if (serviceStaffLists.length === 0) return [];

    // Compute the intersection of all staff arrays.
    const intersection = serviceStaffLists.reduce((acc, list) => {
      return acc.filter((id) => list.includes(id));
    }, serviceStaffLists[0]);

    return intersection;
  }, [catalogue, selectedServiceObjects]);

  // Filter the staff list by checking if the staff's id is in availableStaffIds.
  // Prepend the "Any professional" option.
  const filteredStaff = useMemo(() => {
    const anyOption = {
      id: "any",
      staffName: "Any professional",
      note: "for maximum availability",
      icon: <UserGroupIcon className="w-6 h-6" />,
    };

    const matchingStaff = staffMembers.filter((staff) =>
      availableStaffIds.includes(staff.id)
    );

    return [anyOption, ...matchingStaff];
  }, [staffMembers, availableStaffIds]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-3">
        <span>Services &gt; Professional &gt; Time &gt; Confirm</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6">Select professional</h1>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8 slide-animated">
        {filteredStaff.map((staff) => {
          const isSelected = selectedStaff === staff.id;
          return (
            <div
              key={staff.id}
              onClick={() => dispatch(addStaff(staff.id))}
              className={`flex flex-col items-center justify-center border rounded-md p-4 cursor-pointer transition-colors h-full ${
                isSelected
                  ? "border-indigo-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {staff.id === "any" && staff.icon ? (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 text-indigo-700 mb-2">
                  {staff.icon}
                </div>
              ) : (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-600 mb-2 font-semibold">
                  {staff.staffName?.charAt(0)}
                </div>
              )}
              <p className="text-sm font-medium text-gray-800">
                {staff.staffName}
              </p>
              {staff.note && (
                <p className="text-xs text-gray-500">{staff.note}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
