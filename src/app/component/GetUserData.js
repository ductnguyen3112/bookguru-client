"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoggedIn, setClientData } from "@/app/redux/slices/dataSlice";
import { setGroupClientData } from "@/app/redux/slices/groupSlice";

function GetUserData() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.data.isLoggedIn);
  const [hasChecked, setHasChecked] = useState(false);


  useEffect(() => {
    if (hasChecked) return; // Prevent multiple calls

    const verifyToken = async () => {
      try {
        const token = localStorage.getItem("token");
      

        if (!token) {
          dispatch(setLoggedIn(false));
          setHasChecked(true);
          return;
        }

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
      } finally {
        setHasChecked(true);
      }
    };

    verifyToken();
  }, []);

  return <div></div>;
}

export default GetUserData;
