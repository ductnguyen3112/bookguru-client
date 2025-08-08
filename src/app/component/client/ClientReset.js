"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setModal } from "@/app/redux/slices/dataSlice";
import { resetPassword } from "@/app/redux/slices/authSlice";

const ClientReset = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleReset = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // dispatch the Redux thunk and unwrap its result
      await dispatch(resetPassword(password)).unwrap();

      toast.success("Password reset successful");
      dispatch(setModal(false));
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 text-center w-80">
      <div className="mt-2 px-2 py-3">
        <h3 className="text-lg leading-6 font-medium text-dark">
          Reset Password
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Please Update Your Password
        </p>

        <div className="mt-2">
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter Password"
            className="w-full py-4 px-6 border border-[#9ca3af] rounded-md shadow-sm text-center"
            disabled={loading}
          />
        </div>

        <div className="mt-2">
          <input
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm Password"
            className="w-full py-4 px-6 border border-[#9ca3af] rounded-md shadow-sm text-center"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="mt-5 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-black hover:bg-opacity-90"
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

export default ClientReset;
