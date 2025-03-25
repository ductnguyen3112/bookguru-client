"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ServicesPage({ data }) {
  const { catalogue, businessURL } = data;

  const router = useRouter();

  // Set "all" as the default active tab to show all services
  const [activeTab, setActiveTab] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState({});

  // If "All Services" tab is active, aggregate services from every category.
  // Otherwise, use the selected category.
  let activeServices = [];
  let activeCategoryInfo = null;
  if (activeTab === "all") {
    activeServices = catalogue.flatMap((category) =>
      category.categoryServices.filter((service) => service.show)
    );
  } else {
    const activeCategory = catalogue[activeTab];
    activeCategoryInfo = activeCategory;
    activeServices = activeCategory.categoryServices.filter(
      (service) => service.show
    );
  }

  const isExpanded = expandedCategories[activeTab];
  const displayedServices = isExpanded ? activeServices : activeServices.slice(0, 3);

  const toggleExpand = () => {
    setExpandedCategories((prev) => ({
      ...prev,
      [activeTab]: !prev[activeTab],
    }));
  };

  // Handler to navigate to the booking page for the selected service
  const handleBook = (serviceId) => {
    // Update the URL with the selected serviceId as a query parameter
    router.push(`/v1/${businessURL}/booking?serviceId=${serviceId}`);
  };

  return (
    <>
      {/* Category Tabs with an "All Services" option */}
      <div className="flex space-x-4 border-b pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-2 py-1 text-sm whitespace-nowrap ${
            activeTab === "all"
              ? "border-b-2 mb-2 border-black font-medium"
              : "text-gray-500"
          }`}
        >
          All Services
        </button>
        {catalogue.map((category, index) => (
          <button
            key={category._id}
            onClick={() => setActiveTab(index)}
            className={`px-2 py-1 text-md whitespace-nowrap ${
              activeTab === index
                ? "border-b-2 mb-2 border-gray-800 font-medium"
                : "text-gray-500"
            }`}
          >
            {category.categoryName}
          </button>
        ))}
      </div>

      {/* Active Category / All Services Section */}
      <div>
        {activeTab === "all" ? (
          <h2 className="text-xl font-semibold text-gray-800 mt-4">All Services</h2>
        ) : (
          <>
            <div className="flex items-center my-5">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: activeCategoryInfo.categoryColor }}
              />
              <h2 className="text-xl font-semibold text-gray-800">
                {activeCategoryInfo.categoryName}
              </h2>
            </div>
            {activeCategoryInfo.categoryNote && (
              <p className="text-gray-500 text-sm mb-2">
                {activeCategoryInfo.categoryNote}
              </p>
            )}
          </>
        )}

        {/* List of Services */}
        <div className="space-y-4 mt-5">
          {displayedServices.map((service) => (
            <div
              key={service._id}
              className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <div>
                <h3 className="font-medium text-gray-800">
                  {service.serviceName}
                </h3>
                <p className="text-sm text-gray-500">
                  Duration: {service.duration} min
                </p>
                <p className="text-sm text-gray-500">
                  Price: ${service.price}
                </p>
              </div>
              <button
                onClick={() => handleBook(service._id)}
                className="bg-white text-black px-2 py-1 border border-gray-300 rounded-lg hover:bg-black hover:text-white"
              >
                Book
              </button>
            </div>
          ))}
        </div>

        {/* Show More / Show Less Button */}
        {activeServices.length > 3 && (
          <div className="mt-4 text-center">
            <button
              onClick={toggleExpand}
              className="text-black font-medium underline"
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
