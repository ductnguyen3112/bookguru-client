// src/app/api/group/add-appointment/route.js
import { connect } from "@/app/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Business from "@/app/model/businessModel";
import Appointment from "@/app/model/appointmentModel";
import Staff from "@/app/model/staffModel";
import Client from "@/app/model/clientModel";
import { pusherServer } from "@/app/helper/helper";
import moment from "moment-timezone";

connect();

export async function POST(request) {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    const body = await request.json();
    console.log("Received group appointment request:", body);
    
    const {
      url,
      guests,
      groupStart,
      groupEnd,
      groupDuration,
      note = "",
      servicesByGuest = {},
      preferenceByGuest = {},
    } = body;

    // 1) Validate required fields
    if (!url || !guests?.length || !groupStart || !groupEnd) {
      console.log("Missing required fields:", {
        url: !!url,
        guestsLength: guests?.length,
        groupStart: !!groupStart,
        groupEnd: !!groupEnd
      });
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Validate and normalize date formats
    const startMoment = moment(groupStart);
    const endMoment = moment(groupEnd);
    
    if (!startMoment.isValid() || !endMoment.isValid()) {
      console.log("Invalid date formats:", { groupStart, groupEnd });
      return NextResponse.json(
        { success: false, message: "Invalid date formats provided" },
        { status: 400 }
      );
    }

    // Ensure start is before end
    if (startMoment.isSameOrAfter(endMoment)) {
      console.log("Invalid time range - start must be before end:", { groupStart, groupEnd });
      return NextResponse.json(
        { success: false, message: "Invalid time range - start time must be before end time" },
        { status: 400 }
      );
    }

    // ✅ Properly define normalized times
    const normalizedStart = startMoment.utc().toISOString();
    const normalizedEnd = endMoment.utc().toISOString();
    
    console.log("Normalized times:", {
      original: { groupStart, groupEnd },
      normalized: { normalizedStart, normalizedEnd }
    });

    // 2) Load business
    const business = await Business.findOne({ businessURL: url }).session(session);
    if (!business) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    const timezone = business.businessTimezone;
    console.log(`Business found: ${business.businessName}, timezone: ${timezone}`);
    
    // ✅ Find the main booker (guest with isMainBooker: true)
    const mainBooker = guests.find(guest => guest.isMainBooker === true);
    if (!mainBooker) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Main booker not found" },
        { status: 400 }
      );
    }

    // ✅ Get main booker's client data (all guests should have same userId)
    const mainUserId = mainBooker.userId;
    if (!mainUserId) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Main booker userId not provided" },
        { status: 400 }
      );
    }

    const mainClient = await Client.findById(mainUserId).session(session);
    if (!mainClient) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Main booker client not found" },
        { status: 404 }
      );
    }

    const mainBookerName = mainClient.clientName;
    console.log(`Main booker: ${mainBookerName} (ID: ${mainUserId})`);
    console.log(`All guests will be linked to this account`);
    
    const groupId = new mongoose.Types.ObjectId();
    const createdAppointments = [];
    const conflictErrors = [];

    // 3) Check staff conflicts for all guests first
    for (const guest of guests) {
      const { id, staffId } = guest;

      // ✅ Each guest should already have their own staffId assigned
      if (!staffId || staffId === "any") {
        conflictErrors.push(`Guest ${id} does not have a staff member assigned`);
        continue;
      }

      // Validate staff exists
      const staff = await Staff.findById(staffId).session(session);
      if (!staff) {
        conflictErrors.push(`Staff not found for guest ${id}`);
        continue;
      }

      // ✅ Check for conflicts with the assigned staff
      console.log(`Checking conflicts for guest ${id} with staff ${staff.staffName} (${staffId})`);
      console.log(`Time slot: ${normalizedStart} to ${normalizedEnd}`);
      
      const existingAppointments = await Appointment.find({
        staff: staffId,
        status: { $ne: "canceled" },
        $or: [
          {
            start: { $lt: normalizedEnd },
            end: { $gt: normalizedStart }
          }
        ]
      }).session(session);

      console.log(`Found ${existingAppointments.length} existing appointments for staff ${staff.staffName}`);
      
      if (existingAppointments.length > 0) {
        console.log("Existing appointments:");
        existingAppointments.forEach((appt, index) => {
          console.log(`  ${index + 1}. ${appt.start} to ${appt.end} (${appt.name})`);
        });
        
        conflictErrors.push(
          `Staff ${staff.staffName} is not available during ${moment(normalizedStart).tz(timezone).format('MMM DD, h:mm A')} - ${moment(normalizedEnd).tz(timezone).format('h:mm A')} (${existingAppointments.length} existing appointment${existingAppointments.length > 1 ? 's' : ''})`
        );
        continue;
      }

      console.log(`✅ No conflicts found for staff ${staff.staffName} assigned to guest ${id}`);
    }

    // 4) If there are conflicts, return them
    if (conflictErrors.length > 0) {
      await session.abortTransaction();
      return NextResponse.json(
        { 
          success: false, 
          message: "Scheduling conflicts detected",
          conflicts: conflictErrors 
        },
        { status: 409 }
      );
    }

    // ✅ 5) Create appointments for each guest under main booker's name
    for (const guest of guests) {
      const { id, name, staffId, total = 0, duration = 0, isMainBooker } = guest;
      
      // Get staff info
      const staff = await Staff.findById(staffId).session(session);
      const guestServices = servicesByGuest[id] || [];
      
      // ✅ Format appointment name: Main booker for first guest, "MainName (Guest X)" for others
      let appointmentName;
      if (isMainBooker) {
        appointmentName = mainBookerName;
      } else {
        // Use provided name or fallback to "Guest X" format
        const guestName = name && name.trim() !== "" ? name : `Guest ${id}`;
        appointmentName = `${mainBookerName} (${guestName})`;
      }

      console.log(`Creating appointment for guest ${id}:`, {
        appointmentName,
        providedName: name,
        staffId,
        staffName: staff?.staffName,
        servicesCount: guestServices.length,
        isMainBooker
      });

      // ✅ Build appointment data
      const appointmentData = {
        name: appointmentName, // ✅ All appointments under main booker's name with guest notation
        businessId: business._id,
        groupId,
        services: guestServices,
        start: normalizedStart,
        end: normalizedEnd,
        staff: staffId, // ✅ Each guest has their own assigned staff
        userId: mainUserId, // ✅ All appointments linked to main booker's account
        total,
        duration: groupDuration,
        note,
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

      console.log("Creating appointment with data:", {
        name: appointmentData.name,
        start: appointmentData.start,
        end: appointmentData.end,
        staff: appointmentData.staff,
        staffName: staff?.staffName,
        servicesCount: appointmentData.services.length
      });

      // Create appointment
      const appointment = new Appointment(appointmentData);
      await appointment.save({ session });

      console.log(`✅ Appointment created with ID: ${appointment._id} for "${appointmentName}" with ${staff?.staffName}`);

      // ✅ Link all appointments to main booker's client record
      if (!business.customers.includes(mainUserId)) {
        business.customers.push(mainUserId);
      }
      mainClient.appointments.push(appointment._id);

      // Trigger real-time notification
      try {
        await pusherServer.trigger(
          `${business._id}_channel`,
          "appointment",
          { message: "add", appointment }
        );
      } catch (pusherError) {
        console.warn("Pusher notification failed:", pusherError.message);
        // Don't fail the whole transaction for pusher errors
      }

      createdAppointments.push({
        ...appointment.toObject(),
        staffName: staff.staffName,
        guestId: id,
        guestName: appointmentName
      });
    }

    // ✅ Save main client with all appointment references
    await mainClient.save({ session });
    await business.save({ session });

    // Commit transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Group appointments created successfully",
      groupId,
      appointments: createdAppointments,
      summary: {
        totalAppointments: createdAppointments.length,
        mainBooker: mainBookerName,
        groupDuration,
        startTime: moment(normalizedStart).tz(timezone).format("MMMM DD, YYYY h:mm A"),
        endTime: moment(normalizedEnd).tz(timezone).format("h:mm A"),
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Group appointment creation error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to create group appointments",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}