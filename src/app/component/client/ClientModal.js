"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

import ClientPhoneSignin from "./ClientPhoneSignin";
import ClientVerify from "./ClientVerify";
import ClientLogin from "./ClientLogin";
import ClientRegister from "./ClientRegister";
import ClientReset from "./ClientReset";

import {
  setModal,
  setModalTitle,
  setConfirmOTP,
  setResendDisabled,
  setRemainingTime,
  setLoading,
} from "@/app/redux/slices/dataSlice";

export default function Modal() {
  const dispatch = useDispatch();
  const modalTitle = useSelector((state) => state.data.modalTitle);
  const phoneNumber = useSelector((state) => state.data.client.phone);
  const open = useSelector((state) => state.data.modal);

  const closeModal = () => {
    dispatch(setModal(false));
  };

  const phoneSignin = async () => {
    dispatch(setLoading(true));
    try {
      const response = await fetch("/api/sms/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.status === "user-found") {
        dispatch(setModalTitle("ClientLogin"));
        dispatch(setLoading(false));
      }

      if (data.status === "pending") {
        dispatch(setConfirmOTP(true));
        dispatch(setResendDisabled(true));
        dispatch(setModalTitle("ClientVerify"));
        dispatch(setLoading(false));

        let timeLeft = 30;
        const countdownInterval = setInterval(() => {
          timeLeft -= 1;
          dispatch(setRemainingTime(timeLeft));
          if (timeLeft === 0) {
            clearInterval(countdownInterval);
            dispatch(setResendDisabled(false));
          }
        }, 1000);
      }

      if (data.error) {
        toast.error(data.error);
        dispatch(setLoading(false));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Dialog open={open} onClose={closeModal} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <button
                className="absolute top-0 right-0 mt-4 mr-4 text-black text-2xl leading-none z-50 hidden"
                onClick={closeModal}
              >
                &times;
              </button>

              {modalTitle === "ClientPhoneSignin" && (
                <ClientPhoneSignin phoneSignin={phoneSignin} />
              )}
              {modalTitle === "ClientRegister" && <ClientRegister />}

              {modalTitle === "ClientVerify" && (
                <ClientVerify phoneSignin={phoneSignin} />
              )}
              {modalTitle === "ClientReset" && <ClientReset />}

              {modalTitle === "ClientLogin" && <ClientLogin />}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
