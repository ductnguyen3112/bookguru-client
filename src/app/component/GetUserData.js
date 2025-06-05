"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoggedIn, setClientData } from "@/app/redux/slices/dataSlice";

function GetUserData() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.data.isLoggedIn);
 

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Retrieve token from local storage
        const token = localStorage.getItem("token");
   

        // Include token in the request headers
        const response = await axios.get(`/api/client/signin/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data.data;
    
        dispatch(setLoggedIn(true));
        dispatch(setClientData(data));
      } catch (error) {
        dispatch(setLoggedIn(false));

        // Handle errors here
      }
    };

    verifyToken();
  }, [isLoggedIn]);
  return <div></div>;
}

export default GetUserData;
