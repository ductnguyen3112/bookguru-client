"use client";

import React from "react";

const Preloader = ({ label = "Loading…" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="flex items-center space-x-3">
        <span className="inline-block h-10 w-10 rounded-full border-2 border-gray-100 border-t-gray-900 animate-spin" />
        {/* <span className="text-sm text-gray-700">{label}</span> */}
      </div>
    </div>
  );
};

export default Preloader;
