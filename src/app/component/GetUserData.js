"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { verifyToken } from "@/app/redux/slices/authSlice";

function GetUserData() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(verifyToken()); // Dispatch Redux action to verify token
  }, [dispatch]);

  return <div></div>;
}

export default GetUserData;
