import React, { useState } from "react";
import { useSelector, useDispatch } from "@/redux/store";
import { setModal } from "@/app/redux/slices/dataSlice";

import axios from "axios";
import toast from "react-hot-toast";

const ClientRegister = () => {
  const dispatch = useDispatch();
  const phoneNumber = useSelector((state) => state.client.phone);

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const userSignup = async () => {
    const { firstName, lastName, email, password } = user;

    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill out all fields.");
      return;
    }

    const signUpData = {
      name: `${firstName} ${lastName}`,
      email,
      phone: phoneNumber,
      password,
    };

    try {
      const response = await axios.post("/api/client/signup", signUpData);
      const data = response.data;

      if (data.status === 200) {
        toast.success("SignUp Successful");
        dispatch(setModal(false));

        localStorage.setItem("token", data.token);
      }
    } catch (error) {
      toast.error("An error occurred! Please refresh and try again.");
    }
  };

  return (
    <div className="mt-3 text-center w-80">
      <div className="mt-2 px-2 py-3">
        <h3 className="text-lg leading-6 font-medium text-dark">Register</h3>
        <p className="mt-2 text-sm text-gray-500">
          Enter your info to register
        </p>

        <div className="mt-2 flex">
          <input
            type="text"
            onChange={onInputChange}
            name="firstName"
            placeholder="First Name"
            className="w-1/2 py-4 px-4 border border-[#9ca3af] rounded-md shadow-sm mr-2"
          />
          <input
            type="text"
            onChange={onInputChange}
            name="lastName"
            placeholder="Last Name"
            className="w-1/2 py-4 px-4 border border-[#9ca3af] rounded-md shadow-sm"
          />
        </div>
        <div className="mt-2">
          <input
            type="text"
            onChange={onInputChange}
            name="email"
            placeholder="Enter email"
            className="w-full py-4 px-6 border border-[#9ca3af] rounded-md shadow-sm"
          />
        </div>
        <div className="mt-2">
          <input
            type="password"
            onChange={onInputChange}
            name="password"
            placeholder="Enter Password"
            className="w-full py-4 px-6 border border-[#9ca3af] rounded-md shadow-sm"
          />
        </div>

        <button
          onClick={userSignup}
          className="mt-5 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-black hover:bg-opacity-90"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default ClientRegister;
