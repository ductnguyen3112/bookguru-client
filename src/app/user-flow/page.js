import Link from "next/link";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/20/solid";

export default function UserFlow() {
  return (
    <div className="relative flex h-screen flex-col md:flex-row">
      {/* Close to Home */}
      <Link
        href="/"
        aria-label="Close and go back to home"
        className="absolute right-4 top-4 md:right-6 md:top-6 z-10 rounded-full p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
      </Link>

      {/* Left Section: Image */}
      <div className="md:w-1/2 w-full bg-gray-100">
        <img
          src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-x=.4&w=2560&h=3413&&q=80"
          alt="User browsing on phone"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right Section: Login Options */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-white px-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
          Sign up/log in
        </h1>

        <div className="w-full max-w-lg space-y-4">
          {/* Customers */}
          <button
            type="button"
            className="w-full rounded-xl border border-gray-300  px-5 py-4 text-left  transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold text-gray-900">
                  BookGuru for customers
                </div>
                <p className="mt-0.5 text-base text-gray-500">
                  Book salons and spas near you
                </p>
              </div>
              <ChevronRightIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Professionals */}
          <button
            type="button"
            className="w-full rounded-xl border border-gray-300  px-5 py-4 text-left  transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold text-gray-900">
                  BookGuru for business
                </div>
                <p className="mt-0.5 text-base text-gray-500">
                  Manage and grow your business
                </p>
              </div>
              <ChevronRightIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-between w-full max-w-lg text-sm text-gray-600">
          <a href="#" className="hover:text-gray-900">
            English
          </a>
          <a href="#" className="hover:text-gray-900">
            Help and support
          </a>
        </div>
      </div>
    </div>
  );
}
