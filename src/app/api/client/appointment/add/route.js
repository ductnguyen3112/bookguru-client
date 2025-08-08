import { connect } from "@/app/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Business from "@/app/model/businessModel";
import Appointment from "@/app/model/appointmentModel";
import Staff from "@/app/model/staffModel";
import Client from "@/app/model/clientModel";
import { pusherServer } from "@/app/helper/helper";

import moment from "moment-timezone";

connect();

export async function POST(request) {
  try {
    const reqBody = await request.json();

    const {
      url,
      servicesId,
      userId,
      total,
      note,
      start,
      end,
      duration,
      staff,
      status,
      preference,
    } = reqBody;

    const business = await Business.findOne({ businessURL: url });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const user = await Client.findOne({ _id: userId });

    if (!user) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const existingCustomer = business.customers.find(
      (customer) => customer.toString() === userId
    );

    if (!existingCustomer) {
      business.customers.push(userId);
      await business.save();
    }

    const staffMember = await Staff.findOne({ _id: staff });
    if (!staffMember) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const blockedUser = business.blocked.includes(userId);
    if (blockedUser) {
      return NextResponse.json({ error: "Blocked user" }, { status: 401 });
    }

    const appointments = await Appointment.find({
      staff: staff,
      start: { $gte: start, $lte: end },
    });

    // if (appointments.length > 0) {

    //   return NextResponse.json({
    //     message: "Appointment not available at this time",
    //     success: false,
    //     status: 401,
    //   });
    // }

    let services = [];

    if (Array.isArray(servicesId) && servicesId.length > 0) {
      const allServices = business.catalogue.flatMap(
        (cat) => cat.categoryServices
      );

      services = servicesId
        .map((s) =>
          allServices.find(
            (service) => service._id?.toString() === s._id?.toString()
          )
        )
        .filter(Boolean); // removes undefined if not found
    }

    const newAppointment = {
      name: user.clientName,
      businessId: business._id,
      userId: userId,
      total: total,
      note: note,
      staff: staff,
      start: start,
      end: end,
      status: status,
      duration: duration,
      type: "appointment",
      services: servicesId,
      preference,
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

    const appointment = new Appointment(newAppointment);

    await appointment.save();

    user.appointments.push(appointment._id);
    await user.save();

    await pusherServer.trigger(
      `${appointment.businessId}_channel`,
      "appointment",
      {
        message: "add",
        appointment: appointment,
      }
    );

    const timezone = business?.businessTimezone || "America/New_York"; // or your default

    const bookTime = moment(start).tz(timezone).format("MMMM DD, YYYY h:mm A");

    const automationData = {
      businessId: business._id,
      email: user.clientEmail,
      phone: user.clientPhone,
      address: business.businessAddress,
      contact: business.businessPhone,
      time: bookTime,
      name: user.clientName,
      status: appointment.status,
      notification: "new",
      code: appointment.code,
    };

    // const adminEmailData = {
    //   email: business.businessEmail,
    //   subject: `New Appointment Notification at ${bookTime}`,
    //   html: `
    //     <html>
    //     <head><style>
    //     .email-container { font-family: Arial; padding: 20px; background: #f9f9f9; }
    //     .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
    //     .content p { font-size: 16px; }
    //     .button { padding: 10px 20px; font-size: 16px; color: white; background-color: #4CAF50; border-radius: 5px; text-decoration: none; margin-top: 20px; }
    //     </style></head>
    //     <body>
    //       <div class="email-container">
    //         <div class="header">New Appointment Notification</div>
    //         <div class="content">
    //           <p>Hello Administrator,</p>
    //           <p>A new appointment has been booked. Here are the details:</p>
    //           <p><strong>Name:</strong> ${user.clientName}</p>
    //           <p><strong>Phone:</strong> ${user.clientPhone}</p>
    //           <p><strong>Email:</strong> ${user.clientEmail}</p>
    //           <p><strong>Appointment Time:</strong> ${bookTime}</p>
    //           <p><strong>Staff Member:</strong> ${staffMember.staffName}</p>
    //           <p><strong>Services:</strong> ${services.map(s => s.serviceName).join(", ")}</p>
    //           <p><strong>Status:</strong> ${appointment.status}</p>
    //           <p><strong>Appointment Code:</strong> ${appointment.code}</p>
    //           <p><strong>Preference:</strong> ${appointment.preference ? "Yes" : "No"}</p>
    //           <a href="https://bookguru.io/dashboard/calendar" class="button">View Appointment</a>
    //         </div>
    //         <div class="footer">
    //           Regards,<br/>bookguru.io
    //         </div>
    //       </div>
    //     </body>
    //     </html>
    //   `,
    // };

    // await automationFilter(automationData);
    // await sendEmail(adminEmailData);
    // await addNotification(appointment._id, "new");

    return NextResponse.json({
      message: "Appointment added to the business",
      success: true,
      appointment: appointment,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
