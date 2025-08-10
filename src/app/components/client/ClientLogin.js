"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import {
  setModalTitle,
  setModal,
  setPhone,
  setLoggedIn,
} from "@/app/redux/slices/dataSlice";
import { login } from "@/app/redux/slices/authSlice";

const ClientLogin = () => {
  const dispatch = useDispatch();

  const router = useRouter();
  const pathname = usePathname();

  const phoneNumber = useSelector((state) => state.data.client.phone);
  const loading = useSelector((state) => state.auth.loading);
  const [password, setPassword] = useState("");

  const userLogin = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    try {
      // run login thunk
      await dispatch(login({ phoneNumber, password })).unwrap();

      // set UI state & close modal
      dispatch(setLoggedIn(true));
      dispatch(setModal(false));
      toast.success("Login successful");

      if (pathname === "/user-flow") {
        router.push("/client");
      }
    } catch (err) {
      toast.error(err || "Login failed");
    }
  };

  const resetPassword = async () => {
    try {
      const res = await fetch(
        `/api/sms/reset-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber }),
        }
      );
      const data = await res.json();

      if (data.status === "user-not-found") {
        toast.error("User not found");
      } else if (data.status === "reset-success") {
        dispatch(setPhone(phoneNumber));
        dispatch(setModal(true));
        dispatch(setModalTitle("ClientVerify"));
      } else {
        toast.error("Unable to start reset flow");
      }
    } catch {
      toast.error("An error occurred! Please try again");
    }
  };

  return (
    <div className="mt-3 text-center w-80 bg-white">
      <div className="mt-2 px-2 py-3">
        <h3 className="text-lg leading-6 font-medium text-dark">
          Please Login
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Enter your password to login
        </p>

        <div className="mt-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full py-4 px-6 border border-[#9ca3af] rounded-md shadow-sm text-center"
            disabled={loading}
          />
        </div>

        <button
          onClick={userLogin}
          disabled={loading}
          className="mt-5 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-black hover:bg-opacity-90"
        >
          {loading ? "Logging in…" : "Log In"}
        </button>

        <p className="mt-3 text-sm">
          Forgot your Password?{" "}
          <button onClick={resetPassword} className="text-black underline">
            Reset Password
          </button>
        </p>
      </div>
    </div>
  );
};

export default ClientLogin;
