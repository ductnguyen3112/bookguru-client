"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import SelectServices from "@/app/component/SelectServices";

import axios from "axios";
import { useDispatch } from "react-redux";
import { setBusiness } from "@/app/redux/slices/dataSlice";
const Page = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`/api/booking/${slug}`);
   
        dispatch(setBusiness(response.data.business));

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug]);
  

  return (
    <div>
      <SelectServices />
    </div>
  );
};

export default Page;
