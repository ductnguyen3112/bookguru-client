import { connect } from "@/app/dbConfig/dbConfig";
import Client from "@/app/model/clientModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export async function POST(request) {
  const reqBody = await request.json();
  const { phoneNumber, password } = reqBody;

  try {
    // Sanitize phone number
    const phone = phoneNumber.replace(/\D/g, "");

    // Find client by phone
    const client = await Client.findOne({ clientPhone: phone });

    if (!client) {
      return new Response(JSON.stringify({ error: "Phone number not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate password
    const validPassword = await bcryptjs.compare(password, client.clientPassword);

    if (!validPassword) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate token
    const tokenData = {
      id: client._id,
      clientPhone: client.clientPhone,
      clientEmail: client.clientEmail,
      clientPassword: client.clientPassword,
      
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "30d",
    });

    return new Response(JSON.stringify({ status: 200, token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
