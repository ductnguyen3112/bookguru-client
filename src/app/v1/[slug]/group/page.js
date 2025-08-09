"use client";
import GroupServices from "@/app/components/group/GroupServices";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setBusiness } from "@/app/redux/slices/dataSlice";

import React from "react";

const Page = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const guestModal = useSelector((state) => state.group.guestModal);

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
      <GroupServices />

    </div>
  );
};

export default Page;
