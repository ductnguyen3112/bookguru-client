import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { setModal } from "@/app/redux/slices/dataSlice";

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

  const resetPassword = async () => {
    // Check if passwords match
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/client/reset", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }


      dispatch(setModal(false));
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      toast.success(data.message);
    } catch (error) {
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mt-3 text-center w-80">
        <div className="mt-2 px-2 py-3">
          <h3 className="text-lg leading-6 font-medium text-dark">
            Reset Password
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Please Update Your Password
          </p>

          <div className="mt-2 ">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              name="password"
              placeholder="Enter Password"
              className="w-full py-4 px-6 border border-[#9ca3af] rounded-md shadow-sm text-center"
            />
          </div>

          <div className="mt-2 ">
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              name="confirm-password"
              placeholder="Confirm Password"
              className="w-full py-4 px-6 border border-[#9ca3af] rounded-md shadow-sm text-center"
            />
          </div>

          <button
            onClick={resetPassword}
            disabled={loading}
            className="mt-5 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-black hover:bg-opacity-90"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientReset;
