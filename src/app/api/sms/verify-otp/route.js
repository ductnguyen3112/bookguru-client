import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Client from "@/app/model/clientModel";
import Verify from "@/app/model/verifyModel";
import { connect } from "@/app/dbConfig/dbConfig";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VA713a256c60aa1fee7ea8dbc2f777cf54";

const client = require("twilio")(accountSid, authToken);

connect();

export async function POST(request) {
  try {
    const { otpCode, phoneNumber } = await request.json();

    if (!otpCode || !phoneNumber) {
      throw new Error("Missing parameters: 'otpCode' or 'phoneNumber'");
    }

    const phone = phoneNumber.replace(/\D/g, "");
    let statusVerify = "";

    if (phone[0] === "1") {
      const verificationData = await Verify.findOne({ phoneNumber });

      if (verificationData?.code === otpCode) {
        statusVerify = "approved";
      } else {
        return NextResponse.json({ error: "invalid" });
      }
    } else {
      const verificationCheck = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({
          code: otpCode,
          to: `${phoneNumber}`,
        });

      if (verificationCheck.status === "approved") {
        statusVerify = verificationCheck.status;
      } else {
        return NextResponse.json({ error: "invalid" });
      }
    }

    if (statusVerify === "approved") {
      const clientData = await Client.findOne({
        clientPhone: phoneNumber.trim().replace("+", ""),
      });

      if (!clientData) {
        return NextResponse.json({ error: "not-found" });
      }

      const tokenData = {
        id: clientData._id,
        clientPhone: clientData.clientPhone,
        clientEmail: clientData.clientEmail,
      };

      const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
        expiresIn: "30d",
      });

      if (!clientData.clientPassword) {
        return NextResponse.json({
          message: "Please set a password",
          success: true,
          status: "reset-password",
          token,
        });
      }

      return NextResponse.json({
        message: "Login successful",
        success: true,
        status: statusVerify,
        token,
      });
    }
  } catch (error) {
    console.log("Error in OTP verification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
