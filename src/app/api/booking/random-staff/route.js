import { connect } from "@/app/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Business from "@/app/model/businessModel";
import Appointment from "@/app/model/appointmentModel";
import Staff from "@/app/model/staffModel";
import moment from "moment-timezone";

connect();

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { domain, staff, staffs, date, duration } = reqBody;

    const business = await Business.findOne({ reviewURL: domain });
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const timeZone = business.businessTimezone;
    const requestedDay = moment.tz(date, timeZone);
    const dayOfWeek = requestedDay.format("dddd");

    const dayStart = requestedDay.clone().startOf("day").utc().toISOString();
    const dayEnd = requestedDay.clone().endOf("day").utc().toISOString();

    let selectedStaffId = staff;

    // Handle multiple staff selection
    if (staffs && staffs.length > 0) {
      let minTotalDuration = Infinity;

      for (const staffId of staffs) {
        const staffDoc = await Staff.findById(staffId);
        const schedule = staffDoc?.staffSchedule?.[dayOfWeek];

        if (!schedule?.isWork) continue;

        const appointments = await Appointment.find({
          businessId: business._id,
          staff: staffId,
          start: { $gte: dayStart, $lte: dayEnd },
        });

        let totalDuration = 0;
        for (const appt of appointments) {
          totalDuration +=
            new Date(appt.end).getTime() - new Date(appt.start).getTime();
        }

        if (totalDuration < minTotalDuration) {
          minTotalDuration = totalDuration;
          selectedStaffId = staffId;
        }
      }

      if (!selectedStaffId) {
        return NextResponse.json({
          message: "No available staff",
          success: true,
          slots: [],
        });
      }
    }

    // Get staff info
    const staffMember = await Staff.findById(selectedStaffId);
    if (!staffMember) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const staffSchedule = staffMember.staffSchedule[dayOfWeek];
    if (!staffSchedule?.isWork) {
      return NextResponse.json({
        message: "off",
        success: true,
        slots: [],
      });
    }

    const appointments = await Appointment.find({
      businessId: business._id,
      staff: selectedStaffId,
      start: { $gte: dayStart, $lte: dayEnd },
    });

    const businessOpen = business.workHours?.[dayOfWeek]?.open || "09:00";
    const [openHour, openMinute] = businessOpen.split(":").map(Number);
    const [staffStartHour, staffStartMinute] = staffSchedule.start
      .split(":")
      .map(Number);
    const [staffEndHour, staffEndMinute] = staffSchedule.end
      .split(":")
      .map(Number);

    let localTime = moment.tz(date, timeZone).set({
      hour: Math.max(openHour, staffStartHour),
      minute: Math.max(openMinute, staffStartMinute),
      second: 0,
      millisecond: 0,
    });

    const closingTime = moment.tz(date, timeZone).set({
      hour: staffEndHour,
      minute: staffEndMinute,
      second: 0,
      millisecond: 0,
    });

    const currentTime = moment.tz(timeZone);
    const isToday = requestedDay.isSame(currentTime, "day");

    const availableSlots = [];
    const slotIncrement = 15;

    while (
      localTime.clone().add(duration, "minutes").isSameOrBefore(closingTime)
    ) {
      if (
        !isToday ||
        localTime.isAfter(currentTime.clone().add(15, "minutes"))
      ) {
        const slotStart = localTime.clone();
        const slotEnd = localTime.clone().add(duration, "minutes");

        let isSlotAvailable = true;
        for (const appt of appointments) {
          if (appt.status === "canceled") continue;

          const apptStart = moment.tz(appt.start, timeZone);
          const apptEnd = moment.tz(appt.end, timeZone);

          if (slotStart.isBefore(apptEnd) && slotEnd.isAfter(apptStart)) {
            isSlotAvailable = false;
            break;
          }
        }

        if (isSlotAvailable) {
          availableSlots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
          });
        }
      }

      localTime.add(slotIncrement, "minutes");
    }

    return NextResponse.json({
      message: "Available slots",
      success: true,
      staffId: selectedStaffId,
      slots: availableSlots,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
