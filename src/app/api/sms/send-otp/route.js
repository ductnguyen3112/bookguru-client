import { NextResponse } from "next/server";
import { connect } from "@/app/dbConfig/dbConfig";
import Client from "@/app/model/clientModel";
import Verify from "@/app/model/verifyModel";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VA713a256c60aa1fee7ea8dbc2f777cf54";
const client = require("twilio")(accountSid, authToken);

connect();

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();
    const phone = phoneNumber.replace(/\D/g, "");

    // Check if client already exists
    const existingClient = await Client.findOne({ clientPhone: phone });

    if (existingClient && existingClient.clientPassword !== "") {
      return NextResponse.json({ status: "user-found" });
    }

    // If the phone number starts with '1', handle it internally
    if (phone[0] === "1") {
      const existingVerification = await Verify.findOne({ phoneNumber });



      // Generate 6-digit code and 5-minute expiry
      const verifyCode = Math.floor(100000 + Math.random() * 900000);
      const verifyCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

      // Save or update the verification info
      await Verify.findOneAndUpdate(
        { phoneNumber },
        {
          code: verifyCode,
          expiresAt: verifyCodeExpires,
          $inc: { attempts: 1 },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      // Send SMS directly via Twilio (not using Verify service)
      await client.messages.create({
        body: `Your verification code is ${verifyCode}. It expires in 5 minutes.`,
        from: "+14123019953",
        to: phoneNumber,
      });

        // Check if the verification code was sent successfully
      

      return NextResponse.json({
        message: "Verification code sent successfully.",
        status: "pending",
      });

    } else {
      // Use Twilio Verify API for international numbers
      const verification = await client.verify.v2
        .services(verifySid)
        .verifications.create({
          to: `+${phone}`,
          channel: "sms",
        });

      return NextResponse.json({ status: verification.status });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
