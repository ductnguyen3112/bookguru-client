// src/app/api/booking/group-time/route.js
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
    const { domain, guests, date } = await req.json();
    console.log("Received data:", { domain, guests, date });

    // 1) Business & timezone
    const business = await Business.findOne({ businessURL: domain });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    const tz = business.businessTimezone;
    const weekday = moment.tz(date, tz).format("dddd");

    // 2) Group duration
    const groupDuration = guests.reduce(
      (max, g) => Math.max(max, Number(g.duration) || 0),
      0
    );
    if (groupDuration <= 0) {
      return NextResponse.json({ error: "Invalid guest durations" }, { status: 400 });
    }

    // 3) Time helpers
    const now     = moment.tz(tz);
    const isToday = moment.tz(date, tz).isSame(now, "day");
    const buffer  = 15; // min lead
    const step    = 15; // slot increments

    // 4) Separate specific vs any
    const specificStaffGuests = guests.filter(g => g.staff && g.staff !== "any");
    const anyStaffGuests      = guests.filter(g => !g.staff || g.staff === "any");

    // --- NEW: if everyone is “any”, just assign each one in turn to a **distinct** best staff ---
    if (anyStaffGuests.length === guests.length) {
      console.log("All guests = any → assigning distinct best-staff to each");

      // Build a unique pool of all candidates
      let pool = Array.from(
        new Set(anyStaffGuests.flatMap(g => Array.isArray(g.staffs) ? g.staffs : []))
      );
      if (pool.length === 0) {
        return NextResponse.json({
          success: true,
          groupDuration,
          slots: [],
          guests,
          message: "No staff candidates found",
        });
      }

      const staffAvailability = new Map();
      const assignedStaff     = [];

      // For each guest, pick from `pool` the staff with the most free slots
      for (const guest of anyStaffGuests) {
        let best = null, bestCount = -1;

        for (const staffId of pool) {
          const staffDoc = await Staff.findById(staffId);
          if (!staffDoc) continue;
          const sched = staffDoc.staffSchedule?.[weekday];
          if (!sched?.isWork) continue;

          // cache availability
          if (!staffAvailability.has(staffId)) {
            const slots = await getStaffAvailableSlots(
              staffId, business._id, date, tz, sched,
              groupDuration, isToday, now, buffer, step
            );
            staffAvailability.set(staffId, slots);
          }

          const count = staffAvailability.get(staffId).length;
          if (count > bestCount) {
            bestCount = count;
            best = staffId;
          }
        }

        if (!best) {
          console.warn(`No staff left for guest ${guest.id}`);
          continue;
        }

        // assign & remove from pool
        guest.staff = best;
        assignedStaff.push(best);
        pool = pool.filter(id => id !== best);
      }

      // If nobody got assigned, bail
      if (assignedStaff.length === 0) {
        return NextResponse.json({
          success: true,
          groupDuration,
          slots: [],
          guests,
          message: "Could not assign any staff",
        });
      }

      // Intersect availability across all distinct staff
      let common = staffAvailability.get(assignedStaff[0]) || [];
      for (let i = 1; i < assignedStaff.length; i++) {
        const slots = staffAvailability.get(assignedStaff[i]) || [];
        common = common.filter(s => slots.includes(s));
      }

      const slots = common.map(startISO => ({
        start: startISO,
        end: moment(startISO).add(groupDuration, "minutes").toISOString()
      }));

      return NextResponse.json({
        message: "Distinct staff assigned to each guest",
        success: true,
        guests,
        groupDuration,
        slots,
      });
    }

    // --- mixed/specific logic (unchanged) ---
    const staffAvailability = new Map();
    const assignedStaff     = new Set();

    // 4b) First, lock in any specific assignments
    for (const g of specificStaffGuests) {
      const sid = g.staff;
      assignedStaff.add(sid);

      const doc   = await Staff.findById(sid);
      const sched = doc?.staffSchedule?.[weekday];
      if (!doc || !sched?.isWork) {
        return NextResponse.json(
          { success: false, message: `${doc?.staffName || sid} unavailable on ${weekday}` },
          { status: 200 }
        );
      }
      const slots = await getStaffAvailableSlots(
        sid, business._id, date, tz, sched,
        groupDuration, isToday, now, buffer, step
      );
      staffAvailability.set(sid, slots);
    }

    // 4c) Then assign each “any” guest a distinct best staff
    for (const g of anyStaffGuests) {
      const candidates = (Array.isArray(g.staffs) ? g.staffs : [])
                             .filter(id => !assignedStaff.has(id));
      let best = null, bestCount = -1;

      // if no unassigned left, fall back to original
      const pool = candidates.length ? candidates : (Array.isArray(g.staffs) ? g.staffs : []);

      for (const sid of pool) {
        const doc   = await Staff.findById(sid);
        const sched = doc?.staffSchedule?.[weekday];
        if (!doc || !sched?.isWork) continue;

        if (!staffAvailability.has(sid)) {
          const slots = await getStaffAvailableSlots(
            sid, business._id, date, tz, sched,
            groupDuration, isToday, now, buffer, step
          );
          staffAvailability.set(sid, slots);
        }

        const count = staffAvailability.get(sid).length;
        if (count > bestCount) {
          bestCount = count;
          best = sid;
        }
      }

      if (best) {
        assignedStaff.add(best);
        g.staff = best;
      } else {
        console.warn(`No staff available for guest ${g.id}`);
      }
    }

    // 5) Intersect across all assigned staff
    const allIds = Array.from(staffAvailability.keys());
    if (allIds.length === 0) {
      return NextResponse.json({
        success: true,
        groupDuration,
        slots: [],
        guests,
        message: "No staff could be assigned",
      });
    }
    let common = staffAvailability.get(allIds[0]) || [];
    for (let i = 1; i < allIds.length; i++) {
      const s = staffAvailability.get(allIds[i]) || [];
      common = common.filter(t => s.includes(t));
    }
    const slots = common.map(startISO => ({
      start: startISO,
      end: moment(startISO).add(groupDuration, "minutes").toISOString()
    }));



    return NextResponse.json({
      message: "Common availability for group",
      success: true,
      guests,
      groupDuration,
      slots,
    });

  } catch (err) {
    console.error("Group time API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}


// Helper unchanged
async function getStaffAvailableSlots(
  staffId, businessId, date, timezone,
  schedule, duration, isToday, now, buffer, step
) {
  try {
    const [sh, sm] = schedule.start.split(":").map(Number);
    const [eh, em] = schedule.end  .split(":").map(Number);

    let start = moment.tz(date, timezone).set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
    const end   = moment.tz(date, timezone).set({ hour: eh, minute: em, second: 0, millisecond: 0 });

    if (isToday) {
      const min = now.clone().add(buffer, "minutes");
      if (start.isBefore(min)) {
        start = min.clone().startOf("minute");
        const add = step - (start.minute() % step);
        if (add < step) start.add(add, "minutes");
      }
    }

    const dayStart = moment.tz(date, timezone).startOf("day").utc().toISOString();
    const dayEnd   = moment.tz(date, timezone).endOf("day").utc().toISOString();
    const appts    = await Appointment.find({
      businessId,
      staff: staffId,
      start: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: "canceled" }
    }).sort({ start: 1 });

    const blocked = appts.map(a => ({
      start: moment.tz(a.start, timezone),
      end:   moment.tz(a.end,   timezone),
    }));

    const slots = [];
    let cursor = start.clone();
    while (cursor.clone().add(duration, "minutes").isSameOrBefore(end)) {
      const s = cursor.clone(), e = s.clone().add(duration, "minutes");
      if (!blocked.some(b => s.isBefore(b.end) && e.isAfter(b.start))) {
        slots.push(s.utc().toISOString());
      }
      cursor.add(step, "minutes");
    }
    return slots;

  } catch (e) {
    console.error(`Error slots for ${staffId}:`, e);
    return [];
  }
}
