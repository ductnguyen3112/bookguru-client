import { NextResponse } from "next/server";
import { connect } from "@/app/dbConfig/dbConfig";
import Appointment from "@/app/model/appointmentModel";
import { getDataFromToken } from "@/app/helper/getDataFromToken";
import Client from "@/app/model/clientModel";
import Business from "@/app/model/businessModel";
import Staff from "@/app/model/staffModel";
import moment from "moment-timezone";
import { automationFilter } from "@/app/utils/automation";
import { sendAdminNotification } from "@/app/utils/common";

connect();

export async function PUT(request) {
  try {
    const reqBody = await request.json();
    const clientId = await getDataFromToken(request);

    // Accept both status and a convenience flag `cancel` for canceling
    const { appointmentId, status, start, end, staff, cancel } = reqBody;

    if (!clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 }
      );
    }

    const appointmentData = await Appointment.findOne({ _id: appointmentId });
    const client = await Client.findOne({ _id: clientId });

    if (!appointmentData) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointmentData.userId.toString() !== clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Normalize status and decide if this is an explicit cancel action
    const normalizedStatus = typeof status === "string" ? status.toLowerCase() : null;
    const isCancelAction = cancel === true || normalizedStatus === "canceled" || normalizedStatus === "cancelled";

    // Prevent duplicate cancels
    if (isCancelAction && appointmentData.status === "canceled") {
      return NextResponse.json(
        { error: "Appointment already canceled" },
        { status: 400 }
      );
    }

    // Build update payload based on provided fields
    const update = {};
    if (isCancelAction) {
      // When canceling, only update status
      update.status = "canceled";
    } else {
      if (typeof status === "string" && status) {
        update.status = status;
      }
      if (start) update.start = new Date(start);
      if (end) update.end = new Date(end);
      if (staff) update.staff = staff;

      // If start/end provided, update duration as well
      if (update.start && update.end) {
        const ms = new Date(update.end).getTime() - new Date(update.start).getTime();
        if (!Number.isNaN(ms) && ms > 0) {
          update.duration = Math.round(ms / 60000);
        }
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    // Update and get the latest appointment document
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      { $set: update },
      { new: true, runValidators: true }
    );

    // Fire-and-forget: notify client (email/SMS) and admin about the change
    (async () => {
      try {
        const business = await Business.findOne({ _id: updatedAppointment.businessId });
        const staffMember = updatedAppointment.staff
          ? await Staff.findOne({ _id: updatedAppointment.staff })
          : null;

        const timezone = business?.businessTimezone || "America/New_York";
        const bookTime = updatedAppointment.start
          ? moment(updatedAppointment.start).tz(timezone).format("MMMM DD, YYYY h:mm A")
          : "";

        const notificationType = isCancelAction ? "cancel" : "update";

        const automationData = {
          businessId: business?._id || updatedAppointment.businessId,
          email: client?.clientEmail,
          phone: client?.clientPhone,
          address: business?.businessAddress || updatedAppointment.location?.address,
          contact: business?.businessPhone || updatedAppointment.location?.phone,
          time: bookTime,
          name: client?.clientName,
          status: updatedAppointment.status,
          notification: notificationType,
          code: updatedAppointment.code,
        };

        try {
          await automationFilter(automationData);
        } catch (err) {
          console.error("automationFilter error on update:", err);
        }

        try {
          // Attempt to build services array (if business catalogue available)
          let services = [];
          if (Array.isArray(updatedAppointment.services) && business?.catalogue) {
            const allServices = business.catalogue.flatMap((cat) => cat.categoryServices || []);
            services = updatedAppointment.services
              .map((sId) => allServices.find((svc) => svc._id?.toString() === sId?.toString()))
              .filter(Boolean);
          }

          await sendAdminNotification({
            business: business || {},
            appointment: updatedAppointment,
            client: client || {},
            staffMember,
            services,
            bookTime,
          });
        } catch (err) {
          console.error("sendAdminNotification error on update:", err);
        }
      } catch (err) {
        console.error("Notification worker error:", err);
      }
    })();

    return NextResponse.json({
      message: isCancelAction ? "Appointment canceled successfully" : "Appointment updated successfully",
      appointment: updatedAppointment,
    });

    // check for appointment userId if match with the userId in the request
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}
