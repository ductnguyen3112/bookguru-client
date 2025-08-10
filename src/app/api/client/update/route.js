import { NextResponse } from "next/server";
import { connect } from "@/app/dbConfig/dbConfig";
import Client from "@/app/model/clientModel";
import { getDataFromToken } from "@/app/helper/getDataFromToken";

connect();

export async function PUT(request) {
  try {
    const clientId = await getDataFromToken(request);

    if (!clientId) {
      return NextResponse.json({ message: "unauthorized", status: 401 });
    }

    const body = await request.json();

    // Accept both normalized fields and raw fields
    const {
      firstName,
      lastName,
      clientName,
      clientEmail,
      clientPhone,
      countryCode,
      phoneLocal,
      gender,
      clientDOB,
      dobDay,
      dobMonth,
      dobYear,
    } = body || {};

    const update = {};

    // Name
    if (clientName || firstName || lastName) {
      const name = clientName || `${firstName || ""} ${lastName || ""}`.trim();
      if (name) update.clientName = name;
    }

    // Email
    if (typeof clientEmail === "string") update.clientEmail = clientEmail.trim();
    if (!update.clientEmail && typeof body?.email === "string") update.clientEmail = body.email.trim();

    // Phone: prioritize explicit clientPhone; otherwise build from country+local
    if (typeof clientPhone === "string" && clientPhone.trim()) {
      update.clientPhone = clientPhone.replace(/\D/g, "");
    } else if (countryCode || phoneLocal) {
      const cc = String(countryCode || "").replace(/\D/g, "");
      const local = String(phoneLocal || "").replace(/\D/g, "");
      if (cc || local) update.clientPhone = `${cc}${local}`;
    }

    // Gender (normalize and restrict to allowed values)
    if (typeof gender === "string" && gender.trim()) {
      const g = gender.trim().toLowerCase();
      const allowed = new Set(["male", "female", "other"]);
      if (allowed.has(g)) update.gender = g;
    }

    // DOB: accept direct date or day/month/year parts
    let dob = clientDOB;
    if (!dob && (dobDay || dobMonth || dobYear)) {
      // dobMonth can be month name (Jan) or number (1-12)
      const monthMap = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };
      let m = dobMonth;
      let mIndex = null;
      if (typeof m === "string" && m) {
        const mTrim = m.slice(0,3);
        mIndex = monthMap[mTrim] ?? (Number(m) - 1);
      } else if (typeof m === "number") {
        mIndex = m - 1;
      }
      const d = Number(dobDay || 1);
      const y = Number(dobYear || 1900);
      if (!Number.isNaN(y) && mIndex != null && !Number.isNaN(d)) {
        dob = new Date(Date.UTC(y, mIndex, d));
      }
    }
    if (dob) update.clientDOB = new Date(dob);

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "No changes provided", status: 400 });
    }

    const updated = await Client.findByIdAndUpdate(
      clientId,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-clientPassword");

    if (!updated) {
      return NextResponse.json({ message: "User not found", status: 404 });
    }

    return NextResponse.json({ message: "Updated", status: 200, data: { client: updated } });
  } catch (error) {
    console.error("Update client error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
