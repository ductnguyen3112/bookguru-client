"use client";
import React, { useEffect, useState } from "react";
import {
  UserCircleIcon,
  CalendarDaysIcon,
  HeartIcon,
  GiftIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  GlobeAmericasIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/app/redux/slices/authSlice";
import ClientPhoneSignin from "@/app/components/client/ClientPhoneSignin";
import ClientLogin from "@/app/components/client/ClientLogin";
import Preloader from "@/app/components/common/Preloader";
import { initializeAuthOnLoad } from "@/app/redux/slices/authSlice";

const ClientPage = () => {
  const { user: userData, appointments = [] } = useSelector((state) => state.auth);
  const { isAuthenticated, initialized, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  // Kick off auth initialization on mount (idempotent)
  useEffect(() => {
    if (!initialized && !loading) {
      dispatch(initializeAuthOnLoad());
    }
  }, [initialized, loading, dispatch]);

  // While auth state is being determined, show preloader
  if (!initialized || loading) {
    return <Preloader label="Loading your account…" />;
  }

  // If not logged in after initialization, show inline login flow
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          {showLogin ? (
            <ClientLogin />
          ) : (
            <ClientPhoneSignin phoneSignin={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    );
  }

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
          <p className="text-2xl font-bold">{appointments?.length || 0}</p>
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
              onClick={() => router.push("/client/profile")}
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
              onClick={() => router.push("#")}
            >
              <span className="flex items-center">
                <HeartIcon className="h-6 w-6 text-gray-500 mr-2" />
                Favorites
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("#")}
            >
              <span className="flex items-center">
                <GiftIcon className="h-6 w-6 text-gray-500 mr-2" />
                Buy a gift card
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("#")}
            >
              <span className="flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 text-gray-500 mr-2" />
                Forms
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push("#")}
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
              onClick={() => router.push("#")}
            >
              <span className="flex items-center">
                <GlobeAmericasIcon className="h-6 w-6 text-gray-500 mr-2" />
                English
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li
              className="flex items-center justify-between cursor-pointer"
              onClick={() => {
                dispatch(logout());
                router.push("/");
              }}
            >
              <span className="flex items-center">
                <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-500 mr-2" />
                Sign Out
              </span>
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
