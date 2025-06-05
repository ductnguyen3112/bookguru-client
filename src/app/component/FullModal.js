import React from "react";

export default function FullModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    // Overlay: covers entire screen
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
      {/* Modal panel: takes full screen on small devices */}
      <div className="relative w-full h-full bg-white sm:max-w-md sm:mx-auto sm:my-8 sm:rounded-lg sm:h-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Content */}
        <div className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-6">Choose an option</h2>

          {/* Option 1 */}
          <button className="block w-full text-left border rounded-md px-4 py-3 mb-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <p className="font-medium">Book an appointment</p>
            <p className="text-sm text-gray-500">
              Schedule services for yourself
            </p>
          </button>

          {/* Option 2 */}
          <button className="block w-full text-left border rounded-md px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <p className="font-medium">Group appointment</p>
            <p className="text-sm text-gray-500">For yourself and others</p>
          </button>
        </div>
      </div>
    </div>
  );
}
