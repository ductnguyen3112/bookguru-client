import Pusher from "pusher";
import PusherServer from "pusher";
import PusherClient from "pusher-js";
export const getCurrentStep = () => {
  // Using URL to parse pathname makes it more robust
  const { pathname } = new URL(window.location.href);
  const segments = pathname.split("/").filter;
  // The last segment is considered the step. If the business domain is the base, adjust accordingly.
  return segments[segments.length - 1].split("#")[0];
};

export const goBack = () => {
  window.history.back();
};

export const bookAppointment = async (data) => {
  try {
    const response = await axios.post("/api/client/appointment/add", data);

    return response.data;
    // remove cookies
  } catch (error) {
    // console.log(error);
  }
};

export const isToken = () => {
  if (typeof window === "undefined") return false; // prevent crash during SSR
  const token = localStorage.getItem("token");
  return !!token && token !== "null" && token !== "undefined" && token !== "";
};

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRETE,
  cluster: "us2",
  useTLS: true,
});

// Client-side Pusher instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  {
    cluster: "us2",
    authEndpoint: "/api/pusher-auth",
    authTransport: "ajax",
    auth: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  }
);
