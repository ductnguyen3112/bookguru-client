"use client";

import { useState} from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";



export default function Header({ data }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  return (
    <header className="bg-white shadow-md">
      <nav
        aria-label="Global"
        className="mx-auto flex w-full items-center justify-between p-6 lg:px-8"
      >
        <div className="flex flex-1">
          <div className="hidden lg:flex lg:gap-x-12">
            <a className="text-md font-bold text-gray-700 ">Book Guru</a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
        </div>
        <a href="#" className="-m-1.5 p-1.5">
          <span className="sr-only">Your Company</span>
          <img alt="" src={"/logo-icon.svg"} className="h-8 w-auto" />
        </a>
        <div className="flex flex-1 justify-end">
          <a href="#" className="text-sm/6 font-semibold text-gray-900">
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 left-0 z-10 w-full overflow-y-auto bg-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img alt="" src={"/logo-icon.svg"} className="h-8 w-auto" />
            </a>
            <div className="flex flex-1 justify-end">
              <a href="#" className="text-sm/6 font-semibold text-gray-900">
                Log in <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <a className="text-md font-bold text-gray-700 ">Book Guru</a>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
