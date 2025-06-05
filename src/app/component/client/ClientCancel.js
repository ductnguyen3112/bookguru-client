import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "@/redux/store";

import { setModal } from "@/redux/features/modal-slice";

const ClientCancel = () => {
  const dispatch = useDispatch();
  const appointment = useSelector(
    (state) => state.bookingServices.updateAppointment
  );

  const cancelAppointment = async (nType) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        "/api/client/appointment/update",
        {
          appointmentId: appointment._id,
          status: "canceled",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }

      toast.success("Appointment cancelled successfully");
      dispatch(setModal(false));

      if (nType === "rebook") {
        setTimeout(() => {
          window.location.href = `https://bookguru.io/v1/${appointment.location.url}`;
        }, 3000);
      }

    } catch (error) {
      toast.error("Failed to cancel the appointment");
    }
  };

  return (
    <div className="text-center w-80">
      <div className="px-2 py-3">
        <h3 className="text-lg leading-6 font-medium text-dark">
          Cancel Appointment
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Are you sure you want to cancel this appointment?
        </p>

        <button
          onClick={(e) => {
            e.preventDefault();
            cancelAppointment("rebook");
          }}
          className="mt-5 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-primary hover:bg-opacity-90"
        >
          Cancel & Book Another
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            cancelAppointment("cancel");
          }}
          className="mt-2 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-danger hover:bg-opacity-90"
        >
          Just Cancel
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            dispatch(setBookingModal(false));
          }}
          className="mt-2 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-success hover:bg-opacity-90"
        >
          Go back
        </button>
      </div>
    </div>
  );
};

export default ClientCancel;
