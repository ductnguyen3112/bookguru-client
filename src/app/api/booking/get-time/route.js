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
    const dayOfWeek = moment.tz(date, timeZone).format("dddd");

    const dayStart = moment
      .tz(date, timeZone)
      .startOf("day")
      .utc()
      .toISOString();
    const dayEnd = moment.tz(date, timeZone).endOf("day").utc().toISOString();

    let selectedStaffId = staff;

    // If 'staffs' array is provided, find the least busy staff
    if (staffs && Array.isArray(staffs) && staffs.length > 0) {
      let minTotalDuration = Infinity;
      for (const s of staffs) {
        const staffId = typeof s === "string" ? s : s._id;
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
          const start = new Date(appt.start).getTime();
          const end = new Date(appt.end).getTime();
          totalDuration += end - start;
        }

        if (totalDuration < minTotalDuration) {
          minTotalDuration = totalDuration;
          selectedStaffId = staffId;
        }
      }

      if (!selectedStaffId) {
        return NextResponse.json({
          message: "No staff available",
          success: true,
          slots: [],
        });
      }
    }

    const staffMember = await Staff.findOne({ _id: selectedStaffId });
    if (!staffMember) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const staffWorkHours = staffMember.staffSchedule[dayOfWeek];
    if (!staffWorkHours?.isWork) {
      return NextResponse.json({
        message: "off",
        success: true,
        slots: [],
      });
    }

    const { open } = business.workHours[dayOfWeek];
    const [openHour, openMinute] = open.split(":").map(Number);
    const [staffStartHour, staffStartMinute] = staffWorkHours.start
      .split(":")
      .map(Number);
    const [staffEndHour, staffEndMinute] = staffWorkHours.end
      .split(":")
      .map(Number);

    let localTime = moment.tz(date, timeZone).set({
      hour: Math.max(openHour, staffStartHour),
      minute: Math.max(openMinute, staffStartMinute),
      second: 0,
      millisecond: 0,
    });

    const staffFinishTime = moment.tz(date, timeZone).set({
      hour: staffEndHour,
      minute: staffEndMinute,
      second: 0,
      millisecond: 0,
    });

    const appointments = await Appointment.find({
      businessId: business._id,
      staff: selectedStaffId,
      start: { $gte: dayStart, $lte: dayEnd },
    });

    const currentTime = moment.tz(timeZone);
    const requestedDay = moment.tz(date, timeZone);
    const isToday = requestedDay.isSame(currentTime, "day");

    const availableSlots = [];
    const slotIncrement = 15;

    while (
      localTime.clone().add(duration, "minutes").isSameOrBefore(staffFinishTime)
    ) {
      if (
        !isToday ||
        localTime.isAfter(currentTime.clone().add(15, "minutes"))
      ) {
        const slotStart = localTime.clone();
        const slotEnd = slotStart.clone().add(duration, "minutes");

        let isSlotAvailable = true;
        for (const appointment of appointments) {
          if (appointment.status === "canceled") continue;

          const appointmentStart = moment.tz(appointment.start, timeZone);
          const appointmentEnd = moment.tz(appointment.end, timeZone);

          if (
            slotStart.isBefore(appointmentEnd) &&
            slotEnd.isAfter(appointmentStart)
          ) {
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
      slots: availableSlots,
      staff: selectedStaffId,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
