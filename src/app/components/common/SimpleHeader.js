"use client";

import { useRouter, usePathname } from "next/navigation";
import { goBack } from "@/app/helper/helper";

export default function SimpleHeader() {
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  const onClose = () => {
    // Remove "/booking" from the end of the current pathname
    // go back to main page with pathname /v1/[slug]/ remove third segment
    const segments = pathname.split("/");
    if (segments.length > 3) {
      const newPath = segments.slice(0, 3).join("/");
      window.location.href = newPath;
    } else {
      // If there are not enough segments, just go back
      router.back();
    }
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
