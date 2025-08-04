"use client"; // Only if you need client-side functionality in Next.js App Router

import React from "react";

/** 
 * Returns the first letter of a given name, capitalized.
 * If you want more sophisticated initials (e.g., "Jenny Yen" -> "JY"),
 * you can modify this function accordingly.
 */
function getInitial(name = "") {
  return name.charAt(0).toUpperCase();
}

export default function TeamSection({ data }) {
  // Extract the staffs array from your data
  const { staffs = [] } = data;

  // If there are no staff members, render a simple message
  if (staffs.length === 0) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Team</h2>
          <p>No team members found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="container mx-auto ">
        {/* Section Title */}
        <h1 className="text-4xl font-bold mb-8">Team</h1>

        {/* Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {staffs.map((member) => (
            <div key={member._id} className="flex flex-col items-center">
              {/* Circular Avatar */}
              <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center">
                <span className="text-indigo-900 text-2xl font-semibold">
                  {getInitial(member.staffName)}
                </span>
              </div>

              {/* Name */}
              <p className="mt-2 text-sm font-medium text-gray-800 text-center">
                {member.staffName}
              </p>

              {/* If you want to show the profession, uncomment below */}
              {/* 
              <p className="text-xs text-gray-500 text-center">
                {member.staffProfession}
              </p> 
              */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
