import { connect } from "@/app/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/app/helper/getDataFromToken";
import bcryptjs from "bcryptjs";
import Client from "@/app/model/clientModel";

// Initialize database connection
connect();

export async function POST(request) {
  try {
    // Parse request body
    const { password } = await request.json();

    // Get client ID from token
    let clientId;
    try {
      clientId = getDataFromToken(request);
    } catch (tokenError) {
      return NextResponse.json({ error: tokenError.message }, { status: 401 });
    }

    // Find the client, excluding the password
    const client = await Client.findOne({ _id: clientId }).select(
      "-clientPassword"
    );

    // Check if client exists
    if (!client) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate salt and hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Update the client's password in the database
    await Client.updateOne(
      { _id: clientId },
      { 
        clientPassword: hashedPassword,
        resetPassword: false // Optionally reset the resetPassword flag
      }
    );

    return NextResponse.json({
      message: "Password reset successful",
      status: 200,
    });
  } catch (error) {
    // Log the actual error for server-side debugging
    console.error("Password reset error:", error);
    
    return NextResponse.json({ 
      error: "Server error", 
      details: error.message 
    }, { status: 500 });
  }
}