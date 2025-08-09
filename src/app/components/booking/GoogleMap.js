import React from "react";

const GoogleMap = ({ data }) => {
  // Encode the address so it's URL-safe
  const encodedAddress = encodeURIComponent(data.businessAddress);
  // Construct the URL for the embed
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <>
      <div className="my-8">
        <h1 className="text-4xl font-bold text-gray-800">About Us</h1>
        <p className="text-gray-600 font-medium mt-2">
          {data.businessDescription}
        </p>
      </div>

      <div style={{ width: "100%", height: "400px", border: 10 }}>
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 10 }}
          src={mapUrl}
          allowFullScreen
        />
      </div>
    </>
  );
};

export default GoogleMap;
