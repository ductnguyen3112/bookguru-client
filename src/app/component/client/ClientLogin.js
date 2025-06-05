import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { setModalTitle , setModal, setPhone, setLoggedIn } from "@/app/redux/slices/dataSlice";

const ClientLogin = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const phoneNumber = useSelector((state) => state.data.client.phone);
  const [user, setUser] = useState({
    phoneNumber: phoneNumber,
    password: "",
  });

  const userLogin = async () => {
    if (user.password === "") {
      toast.error("Password is required");
      return;
    }

    try {
      const response = await axios.post("/api/client/login", user);
      const data = response.data;

      if (data.status === 200) {
        toast.success("Login Successful");
        dispatch(setModal(false));
        dispatch(setLoggedIn(true));
        // get slug from the url
        const slug = window.location.pathname.split("/")[2];

        if (slug === "client") {
          router.push("/v1/client/dashboard");
        }

        localStorage.setItem("token", data.token);
      }
    } catch (error) {
      // console.error("Error:", error);
      toast.error("An error occured! please refresh and try again");
    }
  };

  const resetPassword = async () => {
    try {
      const response = await axios.post("/api/sms/reset-otp", {
        phoneNumber: user.phoneNumber,
      });

      const data = response.data;

      if (data.status === "user-not-found") {
        toast.error("User not found");
        return;
      }

      if (data.status === "reset-success") {
        dispatch(setPhone(user.phoneNumber));
        dispatch(setModal(true));
        dispatch(setModalTitle("ClientVerify"));

        return;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occured! please refresh and try again");
    }
  };

  return (
    <div>
      {" "}
      <div className="mt-3 text-center w-80">
        <div className="mt-2 px-2 py-3">
          <h3 className="text-lg leading-6 font-medium text-dark">
            Please Login
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Enter your password to login
          </p>

          <div className="mt-2 ">
            <input
              type="password"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              name="passowrd"
              placeholder="Enter Password"
              required
              className="w-full py-4 px-6 border border-[#9ca3af] rounded-md shadow-sm text-center"
            />
          </div>

          <button
            onClick={userLogin}
            className="mt-5 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-black hover:bg-opacity-90"
          >
            Log In
          </button>

          <p className="mt-3 text-sm">
            Forgot your Password?{" "}
            <button onClick={resetPassword} className="text-black">
              Reset Password
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
