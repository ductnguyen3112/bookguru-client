"use client";
import React from "react";
import {
  UserCircleIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  HeartIcon,
  GiftIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  QuestionMarkCircleIcon,
  GlobeAmericasIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const clientPage = () => {
  const userData = useSelector((state) => state.auth.user);
  console.log(userData);
  const router = useRouter();

  return (
    <div className="bg-gray-100 min-h-screen relative ">
      {/* Header Section */}
      <div className="absolute top-6 -left-2 flex items-center">
        <img src="/logo/logo-main.svg" alt="Logo" className="h-8" />
      </div>
      <button
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-200"
        onClick={() => router.push("/")}
      >
        <XMarkIcon className="h-6 w-6 text-gray-600" />
      </button>

      <div className="max-w-xl mx-auto p-6">
        {/* Profile Section */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md mb-6 mt-18 border border-gray-200">
          <div>
            <h2 className="text-xl font-bold">{userData?.clientName}</h2>
            <p className="text-gray-500">Personal profile</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
            <span className="text-lg font-semibold text-gray-700">
              {userData?.clientName?.charAt(0)}
            </span>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg">Total Appointments</h3>
          <p className="text-2xl font-bold">0</p>
          <button
            className="mt-4 bg-white text-purple-500 px-4 py-2 rounded-lg font-medium"
            onClick={() => router.push("/client/appointments")}
          >
            View appointments
          </button>
        </div>

        {/* Navigation Section */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <ul className="space-y-4">
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              <span className="flex items-center">
                <UserCircleIcon className="h-6 w-6 text-gray-500 mr-2" />
                Profile
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/client/appointments")}
            >
              <span className="flex items-center">
                <CalendarDaysIcon className="h-6 w-6 text-gray-500 mr-2" />
                Appointments
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/favorites")}
            >
              <span className="flex items-center">
                <HeartIcon className="h-6 w-6 text-gray-500 mr-2" />
                Favorites
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/gift-card")}
            >
              <span className="flex items-center">
                <GiftIcon className="h-6 w-6 text-gray-500 mr-2" />
                Buy a gift card
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/forms")}
            >
              <span className="flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 text-gray-500 mr-2" />
                Forms
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/settings")}
            >
              <span className="flex items-center">
                <Cog6ToothIcon className="h-6 w-6 text-gray-500 mr-2" />
                Settings
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
          </ul>
        </div>

        {/* Footer Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <ul className="space-y-4">
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/download-app")}
            >
              <span className="flex items-center">
                <ArrowDownTrayIcon className="h-6 w-6 text-gray-500 mr-2" />
                Download the app
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/help-support")}
            >
              <span className="flex items-center">
                <QuestionMarkCircleIcon className="h-6 w-6 text-gray-500 mr-2" />
                Help and support
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("/language")}
            >
              <span className="flex items-center">
                <GlobeAmericasIcon className="h-6 w-6 text-gray-500 mr-2" />
                English
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default clientPage;
