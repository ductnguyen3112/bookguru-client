"use client";

import { useSelector } from "react-redux";

export default function Page() {
  const business = useSelector((state) => state.data.business);
  const phoneLink = `tel:${business.businessPhone}`;

  return (
    <div>
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8 bg-white rounded-xl mx-5 my-20 lg:mx-30">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Thank You!
            <br />
            Your appointment has been confirmed.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            You will receive a confirmation email shortly. You will be redirect
            to the home page in 5 seconds.
          </p>

          <div className="mt-10  items-center justify-center">
            <p className="font-bold">{business.businessName}</p>
            <p>{business.businessAddress}</p>
            <a className="text-primary" href={phoneLink}>
              {business.businessPhone}
            </a>
          </div>

          <div className="mt-5 flex items-center justify-center gap-x-6">
            <a
              href={business.businessDomain}
              className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {business.businessURL}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
