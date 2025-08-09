import Pusher from "pusher";
import PusherServer from "pusher";

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

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRETE,
  cluster: "us2",
  useTLS: true,
});

// Function to compute totals (cost and duration)
export const computeTotals = (services) => {
  let cost = 0;
  let duration = 0;
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    cost += Number(s?.price || 0);
    duration += Number(s?.duration || 0);
  }
  return { cost, duration };
};
