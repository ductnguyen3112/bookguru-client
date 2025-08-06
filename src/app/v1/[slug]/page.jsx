import axios from "axios";
import React from "react";
import { notFound } from "next/navigation";
import Header from "@/app/component/Header";
import Services from "@/app/component/Services";
import BookModal from "@/app/component/BookModal";
import Team from "@/app/component/Team";
import BusinessDetail from "../../component/BusinessDetail";
import GoogleMap from "@/app/component/GoogleMap";
import BusinessHours from "@/app/component/BusinessHour";
import BookSelection from "@/app/component/BookSelection"; // Uncomment if you want to use BookSelection component
import Meta from "@/app/component/Meta";

export default async function Page({ params }) {
  // Await params before using its properties.
  const awaitedParams = await params;
  const { slug } = awaitedParams;
  const decodedSlug = decodeURIComponent(slug);

  async function getData() {
    try {
      const res = await axios.get(
       // "https://bookguru-client.vercel.app/api/booking/" + decodedSlug
        `http:localhost:3000/api/booking/${decodedSlug}` // Use template literal for better readability
      );
      console.log("Response data:", res.data);
      return res.data.business;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        notFound();
      } else {
        console.error("Error fetching data:", error);
        throw error;
      }
    }
  }

  const data = await getData();

  if (!data) {
    notFound();
  }

  return (
    <>
      <Meta data={data} />
      <Header data={data} />
      {/* Uncomment the following line if you want to use BookSelection component */}
      <BookSelection />
      <div className="bg-white mx-2 md:mx-5 h-full">
        <BusinessDetail data={data} />
        <div className="p-4 mx-2 lg:mx-8 mt-5 ">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
            {/* Left side content */}
            <div className="col-span-6">
              <Services data={data} />
              <GoogleMap data={data} />
              <BusinessHours data={data} />
              <Team data={data} />
            </div>
            {/* Desktop BookModal */}
            <div className="col-span-4 ">
              <BookModal data={data} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
