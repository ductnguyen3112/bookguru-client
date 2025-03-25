import axios from "axios";
import React from "react";
import { notFound } from "next/navigation"; // Import notFound
import Header from "@/app/component/Header";
import Services from "@/app/component/Services";
import BookModal from "@/app/component/BookModal";
import Team from "@/app/component/Team";
import BusinessDetail from "../../component/BusinessDetail";
import GoogleMap from "@/app/component/GoogleMap";
import BusinessHours from "@/app/component/BusinessHour";
import Meta from "@/app/component/Meta";

export default async function Page({ params }) {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);

  async function getData() {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/booking/" + decodedSlug
      );
      return res.data.business;
    } catch (error) {
      // Check if the error response status is 400
      if (error.response && error.response.status === 400) {
        notFound();
      } else {
        // You might want to handle other errors or rethrow
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
