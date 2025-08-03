// src/app/api/booking/group-create/route.js
import { connect } from "@/app/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Business from "@/app/model/businessModel";
import Appointment from "@/app/model/appointmentModel";
import Staff from "@/app/model/staffModel";
import Client from "@/app/model/clientModel";
import { pusherServer } from "@/app/helper/helper";

connect();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      url,
      guests,
      groupStart,
      groupEnd,
      groupDuration,
      note,
      servicesByGuest,
      preferenceByGuest,
    } = body;

    // 1) Load business
    const business = await Business.findOne({ businessURL: url });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // 2) Prepare groupId
    const groupId = new mongoose.Types.ObjectId();
    const createdAppointments = [];

    for (const guest of guests) {
      const { id, userId, staffId } = guest;

      // 3) Validate client
      const client = await Client.findById(userId);
      if (!client) {
        return NextResponse.json({ error: `Guest ${userId} not found` }, { status: 404 });
      }

      // 4) Validate staff
      const staff = await Staff.findById(staffId);
      if (!staff) {
        return NextResponse.json({ error: `Staff ${staffId} not found` }, { status: 404 });
      }

      // 5) Check for existing appointment conflicts
      const conflict = await Appointment.findOne({
        staff: staffId,
        $or: [
          { start: { $lt: groupEnd, $gte: groupStart } },
          { end:   { $gt: groupStart, $lte: groupEnd } },
          { start: { $lte: groupStart }, end: { $gte: groupEnd } }
        ]
      });
      if (conflict) {
        return NextResponse.json({
          message: `Staff ${staffId} is not available for guest ${id}`,
          success: false,
          status: 409,
        });
      }

      // 6) Build appointment data
      const apptData = {
        name: client.clientName,
        businessId: business._id,
        groupId,
        services: servicesByGuest[id] || [],
        start: groupStart,
        end: groupEnd,
        staff: staffId,
        userId,
        total: (guest.total || 0),
        duration: groupDuration,
        note: note || "",
        preference: preferenceByGuest[id] || false,
        type: "appointment",
        status: "approved",
        location: {
          business: business.businessName,
          address: business.businessAddress,
          phone: business.businessPhone,
          email: business.businessEmail,
          website: business.businessDomain,
          logo: business.businessLogo,
          url: business.businessURL,
        },
      };

      // 7) Save appointment
      const appointment = new Appointment(apptData);
      await appointment.save();

      // 8) Link to client
      client.appointments.push(appointment._id);
      await client.save();

      // 9) Pusher notify
      await pusherServer.trigger(
        `${business._id}_channel`,
        "appointment",
        { message: "add", appointment }
      );

      createdAppointments.push(appointment);
    }

    return NextResponse.json({
      message: "Group appointments created successfully",
      success: true,
      groupId,
      appointments: createdAppointments
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
