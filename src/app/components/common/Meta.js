import React from "react";

const Meta = (props) => {
  const { data } = props;

  const metaTitle = data.businessName;
  const keyword = `Appointment ${metaTitle}`;

  return (
    <>
      <title>{`${metaTitle} - ${data?.businessAddress}`}</title>
      <meta name="description" content={data?.businessDescription} />
      <meta name="keywords" content={keyword} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph / Facebook
      <meta property="og:title" content={data ?.title} />
      <meta property="og:description" content={data?.description} />
      <meta property="og:image" content={data?.image} />
      <meta property="og:url" content={data?.domain} />
      <meta property="og:type" content="website" />

      {/* Canonical Link */}
      {/* <link rel="canonical" href={data?.url} />
      <link rel="icon" href={data?.favicon} /> */}

      {/* Additional meta tags can be added here */}
    </>
  );
};

export default Meta;
