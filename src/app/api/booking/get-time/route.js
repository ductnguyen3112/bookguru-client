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

    // start with explicit staff if provided, otherwise null when choosing from an array
    let selectedStaffId = staff || null;
    console.log("Selected Staff ID:", selectedStaffId);

    // If 'staffs' array is provided, pick the staff with the earliest available slot,
    // breaking ties by the staff with the most available slots.
    // We'll precompute available slots per staff and reuse them for the selected staff.
    let precomputedAvailableSlots = null;
    if (staffs && Array.isArray(staffs) && staffs.length > 0) {
      const { open } = business.workHours[dayOfWeek] || {};
      const [openHour, openMinute] = (open || "00:00").split(":").map(Number);

      let bestStaffId = null;
      let bestEarliest = null; // moment
      let bestSlotsCount = -1;

      for (const s of staffs) {
        const staffId =
          typeof s === "string" ? s : s && (s._id || s.id) ? (s._id || s.id) : null;
        if (!staffId) continue;

        const staffDoc = await Staff.findById(staffId);
        if (!staffDoc) continue;

        const schedule = staffDoc.staffSchedule?.[dayOfWeek];
        if (!schedule?.isWork) continue;

        const [staffStartHour, staffStartMinute] = schedule.start
          .split(":")
          .map(Number);
        const [staffEndHour, staffEndMinute] = schedule.end.split(":").map(Number);

        // build local time range for this staff
        let localTimeForStaff = moment.tz(date, timeZone).set({
          hour: Math.max(openHour, staffStartHour),
          minute: Math.max(openMinute, staffStartMinute),
          second: 0,
          millisecond: 0,
        });

        const staffFinishTimeForStaff = moment.tz(date, timeZone).set({
          hour: staffEndHour,
          minute: staffEndMinute,
          second: 0,
          millisecond: 0,
        });

        const appointments = await Appointment.find({
          businessId: business._id,
          staff: staffId,
          start: { $gte: dayStart, $lte: dayEnd },
        });

        const currentTime = moment.tz(timeZone);
        const requestedDay = moment.tz(date, timeZone);
        const isTodayLocal = requestedDay.isSame(currentTime, "day");

        const staffSlots = [];
        const slotIncrement = 15;

        while (
          localTimeForStaff.clone().add(duration, "minutes").isSameOrBefore(
            staffFinishTimeForStaff
          )
        ) {
          if (!isTodayLocal || localTimeForStaff.isAfter(currentTime.clone().add(15, "minutes"))) {
            const slotStart = localTimeForStaff.clone();
            const slotEnd = slotStart.clone().add(duration, "minutes");

            let isSlotAvailable = true;
            for (const appointment of appointments) {
              if (appointment.status === "canceled") continue;

              const appointmentStart = moment.tz(appointment.start, timeZone);
              const appointmentEnd = moment.tz(appointment.end, timeZone);

              if (slotStart.isBefore(appointmentEnd) && slotEnd.isAfter(appointmentStart)) {
                isSlotAvailable = false;
                break;
              }
            }

            if (isSlotAvailable) {
              staffSlots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
            }
          }

          localTimeForStaff.add(slotIncrement, "minutes");
        }

        if (staffSlots.length === 0) continue; // no available slots for this staff

        const earliest = moment.tz(staffSlots[0].start, timeZone);

        if (
          bestEarliest === null ||
          earliest.isBefore(bestEarliest) ||
          (earliest.isSame(bestEarliest) && staffSlots.length > bestSlotsCount)
        ) {
          bestEarliest = earliest;
          bestSlotsCount = staffSlots.length;
          bestStaffId = staffId;
          precomputedAvailableSlots = staffSlots;
        }
      }

      if (!bestStaffId) {
        return NextResponse.json({
          message: "No staff available",
          success: true,
          slots: [],
        });
      }

      selectedStaffId = bestStaffId;
    }

    const staffMember = await Staff.findOne({ _id: selectedStaffId });
    if (!staffMember) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // If we precomputed slots (when selecting among multiple staffs), reuse them
    if (precomputedAvailableSlots && Array.isArray(precomputedAvailableSlots)) {
      return NextResponse.json({
        message: "Available slots",
        success: true,
        slots: precomputedAvailableSlots,
        staff: selectedStaffId,
      });
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