"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  setModalTitle,
  setLoggedIn,
  setModal,
} from "@/app/redux/slices/dataSlice";
import { loginWithOTP } from "@/app/redux/slices/authSlice";

const ClientVerify = () => {
  const dispatch = useDispatch();
  const phoneNumber = useSelector((state) => state.data.client.phone);
  const remainingTime = useSelector((state) => state.data.client.remainingTime);
  const resendDisabled = useSelector((state) => state.data.client.resendDisabled);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otpCode) {
      toast.error("Please enter the OTP code");
      return;
    }

    setLoading(true);
    try {
      // dispatch the Redux thunk and unwrap its result
      await dispatch(loginWithOTP({ phoneNumber, otpCode })).unwrap();

      // success: OTP approved and user fetched
      dispatch(setLoggedIn(true));
      dispatch(setModal(false));
      toast.success("Login successful");
    } catch (err) {
      // handle the special RESET_PASSWORD signal
      if (err === "RESET_PASSWORD") {
        dispatch(setModalTitle("ClientReset"));
        toast.success("Please set your new password");
      } else {
        toast.error(err || "Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-900">
        Verify Your Phone
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        Enter the 6-digit code sent to {phoneNumber}.
      </p>

      <input
        type="text"
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value)}
        placeholder="OTP code"
        className="mt-4 w-full px-4 py-3 border rounded-md text-center"
        disabled={loading}
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="mt-6 w-full bg-black text-white py-3 rounded-md hover:opacity-90"
      >
        {loading ? "Verifying…" : "Continue"}
      </button>

      <div className="mt-4 text-sm text-gray-600">
        {remainingTime > 0 ? (
          <>Resend in {remainingTime}s</>
        ) : (
          <button
            onClick={() => dispatch(setModalTitle("ClientPhoneSignin"))}
            disabled={resendDisabled}
            className={`underline ${
              resendDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
};

export default ClientVerify;
