import React from "react";

import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";
import {
  setModalTitle,
  setLoggedIn,
  setModal,

} from "@/app/redux/slices/dataSlice";

const ClientVerify = ({ phoneSignin }) => {
  const dispatch = useDispatch();
  const phoneNumber = useSelector((state) => state.data.client.phone);
  const [loading, setLoading] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const remainingTime = useSelector((state) => state.data.client.remainingTime);
  const resendDisabled = useSelector((state) => state.data.client.resendDisabled);

  const VerifyOTP = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/sms/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, otpCode }),
      });

      const data = await response.json();

      console.log("Verify OTP Response:", data);

      if (data.error === "not-found") {
        toast.error("User not found");
        // activate register modal
        dispatch(setModalTitle("ClientRegister"));
      
      }

      if (data.error === "invalid") {
        toast.error("Invalid verification code");
        setLoading(false);
        return;
      }

      if (data.status === "reset-password") {
        // Handle case where client has not set a password
        dispatch(setModalTitle("ClientReset"));
        localStorage.setItem("token", data.token);
        toast.success("Please set a password");
        setLoading(false);
        return;
      }

      if (data.status === "approved" && data.token) {
        // Save token to local storage
        localStorage.setItem("token", data.token);
        dispatch(setLoggedIn(true));

        // Perform other actions after successful login
        toast.success("Login successful");
        dispatch(setModal(false));
      } else {
        // Handle case where token is not returned or verification fails
        console.error("Error:", data.error || "Verification failed");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Verify your phone number
        </h3>
        <div className="mt-2 px-7 py-3">
          <p className="text-sm text-gray-500">
            Enter the code sent to your phone number
          </p>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Enter OTP"
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full py-4 px-6 border text-center border-[#9ca3af] rounded-md shadow-sm"
            />

            <button
              onClick={VerifyOTP}
              disabled={loading}
              className="mt-5 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-black hover:bg-opacity-90"
            >
              {loading ? "Sending..." : "Continue"}
            </button>
            <div className="flex flex-row mt-2 items-center justify-center text-sm font-medium space-x-1 text-gray-500">
              {remainingTime > 0 ? (
                <p>Resend in {remainingTime} seconds</p>
              ) : (
                <a
                  className={`flex items-center cursor-pointer text-black ${
                    resendDisabled ? "pointer-events-none opacity-50" : ""
                  }`}
                  onClick={phoneSignin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Resend OTP
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientVerify;
