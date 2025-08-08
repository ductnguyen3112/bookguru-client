"use client";

import { useState, useEffect, use } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { setModal, setModalTitle } from "@/app/redux/slices/dataSlice";
import { logout , initializeAuth } from "@/app/redux/slices/authSlice";



export default function Header() {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // pull auth state
  const { isAuthenticated, user } = useSelector((state) => state.auth);


  const triggerLogged = () => {
    if (isAuthenticated) {
      dispatch(logout());
    } else {
      dispatch(setModal(true));
      dispatch(setModalTitle("ClientPhoneSignin"));
    }
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="mx-auto flex w-full items-center justify-between p-6 lg:px-8">
        <div className="flex items-center gap-x-6">
          {/* Logo */}
          <a className="text-lg font-bold text-gray-700">Book Guru</a>
          {/* Welcome message */}
          {isAuthenticated && user && (
            <span className="text-sm text-gray-600">
              Welcome, {user.clientName}
            </span>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden -m-2.5 p-2.5 text-gray-700"
        >
          <span className="sr-only">Open main menu</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Desktop auth button */}
        <button
          onClick={triggerLogged}
          className="hidden lg:inline text-sm font-semibold text-gray-900"
        >
          {isAuthenticated ? "Log Out" : "Login"}
        </button>
      </nav>

      {/* Mobile slide-in menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="lg:hidden"
      >
        <div className="fixed inset-0 bg-black/30" />
        <DialogPanel className="fixed inset-y-0 left-0 z-10 w-3/4 bg-white p-6">
          <div className="flex items-center justify-between">
            {/* Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            {/* Auth button inside mobile menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                triggerLogged();
              }}
              className="text-sm font-semibold text-gray-900"
            >
              {isAuthenticated ? "Log Out" : "Login"}{" "}
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          {/* Optional welcome message */}
          {isAuthenticated && user && (
            <p className="mt-4 text-gray-600">
              Hello, {user.clientName}!
            </p>
          )}
        </DialogPanel>
      </Dialog>
    </header>
  );
}
