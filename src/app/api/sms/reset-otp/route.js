import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { connect } from "@/app/dbConfig/dbConfig";
import Client from "@/app/model/clientModel";
import Verify from "@/app/model/verifyModel";

// Initialize database connection
connect();

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VA713a256c60aa1fee7ea8dbc2f777cf54";
const client = twilio(accountSid, authToken);

export async function POST(request) {
  const { phoneNumber } = await request.json();

  try {
    // Sanitize phone number
    const phone = phoneNumber.replace(/\D/g, "");

    // Check if client exists based on phone number
    const existingClient = await Client.findOne({ clientPhone: phone });

    if (!existingClient) {
      return NextResponse.json({ status: "user-not-found" });
    }

    // Reset the password to empty string
    existingClient.clientPassword = "";
    await existingClient.save();

    if (phone[0] === "1") {
      // For US phone numbers (starting with 1)
      const existingVerification = await Verify.findOne({
        phoneNumber: phoneNumber,
      });

      // Check verification attempts
      if (existingVerification && existingVerification.attempts >= 3) {
        return NextResponse.json(
          {
            error:
              "Maximum verification attempts reached. Please try again later in 5 minutes.",
          },
          { status: 400 }
        );
      }

      // Generate a random 6-digit code
      const verifyCode = Math.floor(100000 + Math.random() * 900000);

      // Set expiration time for 5 minutes from now
      const verifyCodeExpires = new Date(new Date().getTime() + 5 * 60000);

      // Update or insert the verification code in the Verify model
      await Verify.findOneAndUpdate(
        { phoneNumber: phoneNumber },
        {
          code: verifyCode,
          expiresAt: verifyCodeExpires,
          $inc: { attempts: 1 }, // Increment the attempts counter
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      // Send SMS message with Twilio
      await client.messages.create({
        body: `Your verification code is ${verifyCode}. It expires in 5 minutes.`,
        from: "+14123019953",
        to: phoneNumber,
      });

      return NextResponse.json({ status: "reset-success" });
    } else {
      // For international phone numbers
      const verification = await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: phoneNumber, channel: "sms" });

      return NextResponse.json({ status: "reset-success" });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}