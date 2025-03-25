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
    const { domain, staff, date, duration } = reqBody;
    console.log(reqBody);

    // Find the business by reviewURL
    const business = await Business.findOne({ reviewURL: domain });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Verify the staff member exists
    const staffMember = await Staff.findOne({ _id: staff });
    if (!staffMember) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Set the timezone to the business's timezone
    const timeZone = business.businessTimezone;

    // Determine the day of the week in the business's timezone
    const dayOfWeek = moment.tz(date, timeZone).format("dddd");

    // Retrieve business opening hours for reference (only open time is used)
    const { open } = business.workHours[dayOfWeek];

    // Retrieve the staff's working hours for the day
    const staffWorkHours = staffMember.staffSchedule[dayOfWeek];

    // Parse the business's open time
    const [openHour, openMinute] = open.split(":").map(Number);

    // Parse the staff's start and end times
    const [staffStartHour, staffStartMinute] = staffWorkHours.start.split(":").map(Number);
    const [staffEndHour, staffEndMinute] = staffWorkHours.end.split(":").map(Number);

    // Set the initial time to the later of the business's opening time and the staff's start time
    let localTime = moment.tz(date, timeZone).set({
      hour: Math.max(openHour, staffStartHour),
      minute: Math.max(openMinute, staffStartMinute),
      second: 0,
      millisecond: 0,
    });

    // Determine the staff's finishing time (only staff time is considered)
    const staffFinishTime = moment.tz(date, timeZone).set({
      hour: staffEndHour,
      minute: staffEndMinute,
      second: 0,
      millisecond: 0,
    });
    const closingTime = staffFinishTime; // Only checking staff finish time

    // Set day boundaries in UTC to retrieve all appointments for the day
    const dayStart = moment.tz(date, timeZone).startOf("day").utc().toISOString();
    const dayEnd = moment.tz(date, timeZone).endOf("day").utc().toISOString();

    // Retrieve appointments within the day (using the "start" field)
    const appointments = await Appointment.find({
      businessId: business._id,
      staff,
      start: { $gte: dayStart, $lte: dayEnd },
    });

    const currentTime = moment.tz(timeZone);
    // Check if the requested date is today
    const requestedDay = moment.tz(date, timeZone);
    const isToday = requestedDay.isSame(currentTime, "day");

    const availableSlots = [];

    // If the staff is not working that day, return "off"
    if (!staffWorkHours.isWork) {
      return NextResponse.json({
        message: "off",
        success: true,
        slots: [],
      });
    }

    // Use a fixed 15‑minute increment for generating potential slots
    const slotIncrement = 15;

    // Generate slots only if the full service duration fits before the staff finish time
    while (localTime.clone().add(duration, "minutes").isSameOrBefore(closingTime)) {
      // Enforce that for today's date, the slot must start at least 15 minutes in the future.
      if (!isToday || localTime.isAfter(currentTime.clone().add(15, "minutes"))) {
        const slotStart = localTime.clone();
        const slotEnd = localTime.clone().add(duration, "minutes");

        let isSlotAvailable = true;
        for (const appointment of appointments) {
          if (appointment.status === "canceled") continue;
          // Convert appointment times to moment objects in the business's timezone
          const appointmentStart = moment.tz(appointment.start, timeZone);
          const appointmentEnd = moment.tz(appointment.end, timeZone);
          // Check for overlap
          if (slotStart.isBefore(appointmentEnd) && slotEnd.isAfter(appointmentStart)) {
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
      // Move to the next potential slot using the fixed increment (15 minutes)
      localTime.add(slotIncrement, "minutes");
    }

    return NextResponse.json({
      message: "Available slots",
      success: true,
      slots: availableSlots,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
