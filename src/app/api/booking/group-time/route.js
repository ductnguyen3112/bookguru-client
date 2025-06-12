// src/app/api/group/time/route.js
import { connect } from "@/app/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Business from "@/app/model/businessModel";
import Appointment from "@/app/model/appointmentModel";
import Staff from "@/app/model/staffModel";
import moment from "moment-timezone";

// Establish MongoDB connection
connect();

export async function POST(req) {
  try {
    // Parse incoming JSON: domain (business URL), guests array, and target date
    const { domain, guests, date } = await req.json();

    // 1) Lookup business by its businessURL to get its timezone
    const business = await Business.findOne({ businessURL: domain });
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }
    const tz = business.businessTimezone;
    const weekday = moment.tz(date, tz).format("dddd");

    // 2) Compute groupDuration: the longest single service duration among all guests
    const groupDuration = guests.reduce(
      (m, g) => Math.max(m, Number(g.duration) || 0),
      0
    );
    if (groupDuration <= 0) {
      return NextResponse.json(
        { error: "Invalid guest durations" },
        { status: 400 }
      );
    }

    // 3) Prepare day boundaries (UTC ISO strings) and "now" in business timezone
    const dayStart = moment.tz(date, tz).startOf("day").utc().toISOString();
    const dayEnd = moment.tz(date, tz).endOf("day").utc().toISOString();
    const now = moment.tz(tz);
    const isToday = moment.tz(date, tz).isSame(now, "day");
    const buffer = 15; // minutes lead time
    const step = 15;   // minutes increment

    // 4) Build each staff’s free-slot list
    const staffSlots = {};

    for (const guest of guests) {
      let staffId = guest.staff;

      // 4.a) If guest.staff is "any", pick the staff with the most free slots
      if (!staffId || staffId === "any") {
        const candidates = Array.isArray(guest.staffs) ? guest.staffs : [];
        if (candidates.length === 0) {
          console.warn(`No candidate list for guest ${guest.id}, skipping`);
          continue;
        }

        let bestStaff = null;
        let bestCount = -1;

        for (const sid of candidates) {
          const doc = await Staff.findById(sid);
          if (!doc) continue;
          const sched = doc.staffSchedule?.[weekday];
          if (!sched?.isWork) continue;

          // compute available-slot count for this staff
          const startTime = moment.tz(date, tz)
            .set({
              hour: +sched.start.split(":")[0],
              minute: +sched.start.split(":")[1],
              second: 0, millisecond: 0
            });
          const endTime = moment.tz(date, tz)
            .set({
              hour: +sched.end.split(":")[0],
              minute: +sched.end.split(":")[1],
              second: 0, millisecond: 0
            });
          const dayAppts = await Appointment.find({
            businessId: business._id,
            staff: sid,
            start: { $gte: dayStart, $lte: dayEnd }
          });

          let count = 0;
          let cursor = startTime.clone();
          while (cursor.clone().add(groupDuration, "minutes").isSameOrBefore(endTime)) {
            if (!isToday || cursor.isAfter(now.clone().add(buffer, "minutes"))) {
              const slotEnd = cursor.clone().add(groupDuration, "minutes");
              const conflict = dayAppts.some(a => {
                if (a.status === "canceled") return false;
                const aS = moment.tz(a.start, tz);
                const aE = moment.tz(a.end, tz);
                return cursor.isBefore(aE) && slotEnd.isAfter(aS);
              });
              if (!conflict) count++;
            }
            cursor.add(step, "minutes");
          }

          if (count > bestCount) {
            bestCount = count;
            bestStaff = sid;
          }
        }

        if (!bestStaff) {
          console.warn(`No working candidates for guest ${guest.id}, skipping`);
          continue;
        }

        staffId = bestStaff;
        guest.staff = bestStaff;
      }

      // 4.b) Load the assigned staff document
      const staff = await Staff.findById(staffId);
      if (!staff) {
        console.warn(`Staff ${staffId} not found, skipping`);
        continue;
      }

      // 4.c) Pull that staff’s schedule for this weekday
      const sched = staff.staffSchedule?.[weekday];

      // 4.d) If not working, return error with staff name
      if (!sched?.isWork) {
        return NextResponse.json(
          { message: `${staff.staffName} is not available on this date` },
          { status: 200 }
        );
      }

      // 4.e) Generate free slots for this staff
      let cursor = moment.tz(date, tz)
        .set({
          hour: +sched.start.split(":")[0],
          minute: +sched.start.split(":")[1],
          second: 0, millisecond: 0
        });
      const finish = moment.tz(date, tz)
        .set({
          hour: +sched.end.split(":")[0],
          minute: +sched.end.split(":")[1],
          second: 0, millisecond: 0
        });
      const appts = await Appointment.find({
        businessId: business._id,
        staff: staffId,
        start: { $gte: dayStart, $lte: dayEnd }
      });

      const slots = [];
      while (cursor.clone().add(groupDuration, "minutes").isSameOrBefore(finish)) {
        if (!isToday || cursor.isAfter(now.clone().add(buffer, "minutes"))) {
          const slotEnd = cursor.clone().add(groupDuration, "minutes");
          const conflict = appts.some(a => {
            if (a.status === "canceled") return false;
            const aS = moment.tz(a.start, tz);
            const aE = moment.tz(a.end, tz);
            return cursor.isBefore(aE) && slotEnd.isAfter(aS);
          });
          if (!conflict) {
            slots.push(cursor.toISOString());
          }
        }
        cursor.add(step, "minutes");
      }

      staffSlots[staffId] = slots;
    }

    // 5) Intersect all staff slot lists to find common times
    const allStaffIds = Object.keys(staffSlots);
    if (allStaffIds.length === 0) {
      return NextResponse.json({
        success: true,
        groupDuration,
        slots: [],
        guests
      });
    }
    let common = staffSlots[allStaffIds[0]];
    for (const sid of allStaffIds.slice(1)) {
      common = common.filter(start => staffSlots[sid].includes(start));
    }

    // 6) Build final result with start/end pairs
    const slots = common.map(startISO => ({
      start: startISO,
      end: moment(startISO).add(groupDuration, "minutes").toISOString()
    }));

    return NextResponse.json({
      message:      "Common availability for group",
      success:      true,
      guests,
      groupDuration,
      slots,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
