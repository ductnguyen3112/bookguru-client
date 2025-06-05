import React, { useState } from "react";
import { useAppSelector } from "@/redux/store";
import moment from "moment-timezone";

const ClientHistory = () => {
  const [displayCount, setDisplayCount] = useState(5);

  const handleLoadMore = () => {
    setDisplayCount(displayCount + 5);
  };

  const handleClose = () => {
    setDisplayCount(5);
  };

  const appointments = useAppSelector(
    (state) => state.bookingServices.appointmentData
  );

  // Guard clause if data isn't an array
  if (!Array.isArray(appointments)) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-bold mx-2 mt-5">History</h2>
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark my-4">
        {appointments
          .slice(0, displayCount)
          .map((appointment, index) =>
            appointment?.location ? (
              <div key={index} className="px-7 my-3">
                <h3 className="text-black font-medium">
                  {appointment?.services &&
                    appointment.services[0]?.serviceName}
                </h3>
                <p className="text-xs">
                  <span className="font-bold">
                    {moment(appointment?.start).format(
                      "h:mmA - MMMM DD YYYY"
                    )}
                  </span>{" "}
                  - {appointment?.location?.business} -{" "}
                  {appointment?.location?.address}
                </p>
              </div>
            ) : null
          )}

        {appointments.length > 5 && (
          <div className="flex justify-center py-4">
            {displayCount <= 5 ? (
              <button
                onClick={handleLoadMore}
                className="text-primary hover:underline"
              >
                Load More
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="text-primary hover:underline"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientHistory;
