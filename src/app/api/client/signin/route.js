import { NextResponse } from "next/server";
import { connect } from "@/app/dbConfig/dbConfig";
import Client from "@/app/model/clientModel";
import { getDataFromToken } from "@/app/helper/getDataFromToken";
import Appointment from "@/app/model/appointmentModel";

connect();

export async function GET(request) {
  try {
    const clientId = await getDataFromToken(request);

    if (!clientId) {
      return NextResponse.json({
        message: "unauthorized",
        status: 401,
      });
    }

    const client = await Client.findOne({ _id: clientId }).select(
      "-clientPassword"
    );

    if (!client) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const clientAppointments = client.appointments;

    // Retrieve all appointment and return the appointments not only appointment id
    let appointments = [];
    if (clientAppointments) {
      appointments = await Promise.all(
        clientAppointments.map(async (appointmentId) => {
          return await Appointment.findOne({ _id: appointmentId }).select(
            "-businessId"
          );
        })
      );
    }

    return NextResponse.json({
      message: "User found",
      status: 200,
      data: {
        client,
        appointments,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
