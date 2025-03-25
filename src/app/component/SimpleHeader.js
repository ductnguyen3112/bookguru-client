"use client";

import { useRouter } from "next/navigation";
import { goBack } from "@/app/helper/helper";

export default function SimpleHeader() {
  const router = useRouter();

  const onClose = () => {
    // Remove "/booking" from the end of the current pathname
    const newPath = window.location.pathname.replace(/\/booking$/, "");
    window.location.href = newPath.replace(/\/booking\/[^/]+/, "/");
  };

  return (
    <header className="flex items-center justify-between px-4 pt-2">
      {/* Left Arrow */}
      <button
        type="button"
        onClick={goBack}
        className="text-gray-700 hover:text-gray-900 text-2xl"
      >
        &larr;
      </button>

      {/* Right “X” */}
      <button
        type="button"
        onClick={onClose}
        className="text-gray-700 hover:text-gray-900 text-2xl"
      >
        &times;
      </button>
    </header>
  );
}
