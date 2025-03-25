
import React from "react";


export default function BusinessDetail( { data }) {



  const business = data;


  return (
    <div className="mx-5 lg:mx-10">
      {/* Business Title & Info */}
      <div className="my-8">
        <h1 className="text-4xl font-bold text-gray-800">
          {business.businessName}
        </h1>
        <p className="text-gray-600 font-medium mt-2">
          {business.businessAddress} - {business.businessPhone} -{" "}
          {business.businessCategory}
        </p>
      </div>

      {/* Main (featured) image with overlay */}
      <div className="relative col-span-1 md:col-span-2">
        <img
          src="https://onglesjewel.com/wp-content/uploads/2025/03/468939612_18173340244311082_760467991286533471_n.jpg"
          alt="Featured nails"
          className="w-full max-h-120 rounded-lg object-cover"
        />
        
      </div>
      {/* about us */}


      {/* See all images button */}
    </div>
  );
}
