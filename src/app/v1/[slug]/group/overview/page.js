"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
// axios would be imported in your actual project
import moment from "moment-timezone";
import { 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  UserIcon, 
  CheckCircleIcon 
} from "@heroicons/react/24/outline";
import { setModal, setModalTitle } from "@/app/redux/slices/dataSlice";

export default function GroupOverview() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { slug } = useParams();

  const guests = useSelector((state) => state.group.guests);
  const groupTime = useSelector((state) => state.group.time);
  const groupDate = useSelector((state) => state.group.date);
  const business = useSelector((state) => state.data.business);
  const clientData = useSelector((state) => state.data.clientData.client);
  const isLoggedIn = useSelector((state) => state.data.isLoggedIn);
  const token = useSelector((state) => state.auth.token); // Use Redux state for token

  const [buttonValue, setButtonValue] = useState("Confirm Booking");
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  // Calculate group totals
  const totalCost = guests.reduce((sum, guest) => sum + (guest.cost || 0), 0);
  const groupDuration = Math.max(...guests.map(g => g.duration || 0));
  const timezone = business?.businessTimezone || "America/New_York";

  useEffect(() => {
    if (groupTime && business?.businessTimezone) {
      const startTime = moment(groupTime).tz(timezone);
      const endTime = startTime.clone().add(groupDuration, 'minutes');
      
      setAppointmentDetails({
        date: startTime.format("MMMM DD, YYYY"),
        startTime: startTime.format("h:mm A"),
        endTime: endTime.format("h:mm A"),
        duration: groupDuration,
      });
    }
  }, [groupTime, timezone, groupDuration, business]);

  const handleConfirmBooking = async () => {
    if (!token) {
      dispatch(setModal(true));
      dispatch(setModalTitle("ClientPhoneSignin"));
      return;
    }

    if (!isLoggedIn) {
      toast.error("Please log in to continue");
      return;
    }

    setButtonValue("Processing...");

    try {
      // Prepare group appointment data
      const groupData = {
        url: business.businessURL,
        guests: guests.map(guest => ({
          id: guest.id,
          userId: guest.isMainBooker ? clientData._id : guest._id,
          staffId: guest.staff,
          services: guest.services.map(s => s._id),
          total: guest.cost,
          duration: guest.duration,
          isMainBooker: guest.isMainBooker
        })),
        groupStart: groupTime,
        groupEnd: moment(groupTime).add(groupDuration, 'minutes').toISOString(),
        groupDuration,
        note: "",
        servicesByGuest: guests.reduce((acc, guest) => {
          acc[guest.id] = guest.services.map(s => s._id);
          return acc;
        }, {}),
        preferenceByGuest: guests.reduce((acc, guest) => {
          acc[guest.id] = guest.preference || false;
          return acc;
        }, {})
      };

      const response = await axios.post("/api/group/add-appointment", groupData);

      if (response.data.success) {
        toast.success("Group appointment confirmed!");
        router.push(`/v1/${slug}/group/confirm`);
      } else {
        throw new Error(response.data.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong, please try again");
      setButtonValue("Confirm Booking");
    }
  };

  if (!appointmentDetails || !business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl border lg:my-20 border-gray-200 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <UsersIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Group Appointment Overview
          </h1>
          <p className="text-gray-600">
            Review your group appointment details before confirming
          </p>
        </div>

        {/* Business Info */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-center space-x-4">
            {business.businessLogo ? (
              <img
                src={business.businessLogo}
                alt={business.businessName}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {business.businessName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {business.businessName}
              </h2>
              <p className="text-gray-600">{business.businessAddress}</p>
              <a 
                href={`tel:${business.businessPhone}`}
                className="text-blue-600 hover:underline"
              >
                {business.businessPhone}
              </a>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-lg text-gray-900">{appointmentDetails.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time</p>
              <p className="text-lg text-gray-900">
                {appointmentDetails.startTime} - {appointmentDetails.endTime}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Group Duration</p>
              <p className="text-lg text-gray-900">{appointmentDetails.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-lg text-gray-900">${totalCost}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <UsersIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{guests.length}</div>
            <div className="text-sm text-blue-800">Guests</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <ClockIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{groupDuration}</div>
            <div className="text-sm text-green-800">Minutes</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">${totalCost}</div>
            <div className="text-sm text-purple-800">Total</div>
          </div>
        </div>

        {/* Guest List */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Guests ({guests.length})
          </h3>
          <div className="space-y-3">
            {guests.map((guest, index) => (
              <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {guest.name?.charAt(0) || (index + 1)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {guest.name || `Guest ${index + 1}`}
                      {guest.isMainBooker && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Main Booker
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {guest.services?.length ? 
                        `${guest.services.map(s => s.serviceName).join(", ")} • ${guest.duration} min • $${guest.cost}` :
                        "No services selected"
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Please arrive 10-15 minutes before your appointment</li>    
            <li>• Group appointments require 24-hour notice for changes</li>
 
          </ul>
        </div>



        {/* Contact Info */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Questions? Call us at{' '}
            <a href={`tel:${business.businessPhone}`} className="text-blue-600 hover:underline">
              {business.businessPhone}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}