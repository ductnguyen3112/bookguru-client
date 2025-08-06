import { connect } from "@/app/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Client from "@/app/model/clientModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Initialize database connection
connect();

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { name, email, phone, password } = reqBody;

    const clientPhone = phone.replace(/^\+/, "").trim();

    // Check if user exists by email
    const user = await Client.findOne({ clientEmail: email });

    if (user) {
      return NextResponse.json(
        {
          error: "Email Registered, Please use another email or login",
        },
        { status: 400 }
      );
    }

    // Check if phone number exists
    const phoneExist = await Client.findOne({ clientPhone });

    if (phoneExist) {
      return NextResponse.json(
        {
          error: "Phone number already exist",
        },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new client
    const newUser = new Client({
      clientName: name,
      clientEmail: email,
      clientPhone,
      resetPassword: true,
      clientPassword: hashedPassword,
      verified: true, // Set the user as verified initially
    });

    // Save the new user
    const savedUser = await newUser.save();

    // Prepare token data
    const tokenData = {
      id: savedUser._id,
      clientPhone: savedUser.clientPhone,
      clientEmail: savedUser.clientEmail,
      clientPassword: savedUser.clientPassword,
    };

    // Generate JWT token
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "30d",
    });

    // Return response with token
    return NextResponse.json({
      message: "Login successful",
      success: true,
      status: 200,
      token,
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}