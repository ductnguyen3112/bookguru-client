import Business from "@/app/model/businessModel";
import { connect } from "@/app/dbConfig/dbConfig";
import Credit from "@/app/model/CreditModel";
import { sendEmail, sendSMS, sendSMSTemplates } from "@/app/utils/common";

connect();

export const automationFilter = async (value) => {
  try {
    const business = await Business.findOne({ _id: value.businessId });
    if (!business) {
      throw new Error("Business not found");
    }

    const automation = business.automation;
    if (!automation) {
      throw new Error("Automation not found");
    }

    const userData = {
      email: value.email,
      phone: value.phone,
      time: value.time,
      business: business.businessName,
      address: business.businessAddress,
      contact: business.businessPhone,
      client: value.name,
      status: value.status,
      notification: value.notification,
      code: value.code,
    };

    let type = value.notification;
    let emailSent = false;
    let smsSent = false;

    // Send Email if automation is enabled for email and the user has an email
    if (
      (automation[type] === "email" || automation[type] === "all") &&
      userData.email && userData.email.trim() !== ""

    ) {
      try {
        await sendEmail(userData);
        emailSent = true;
      } catch (emailError) {
        console.error(`Error sending email for ${type}: `, emailError);
        // Do not throw - log and continue. Mark emailSent false.
        emailSent = false;
        // Optionally attach error info to return value
        // emailErrorInfo = emailError;
      }
    }

    // Send SMS if automation is enabled for phone and the user has a valid phone number
    if (
      (automation[type] === "phone" || automation[type] === "all") &&
      userData.phone && userData.phone.trim() !== ""
    ) {
      try {
        const credit = await Credit.findOne({ businessId: business._id });

        if (!credit || credit.credits < 0.02) {
          return { success: false, error: "No credits available" };
        }

        // Deduct credits and save
        credit.credits = parseFloat((credit.credits - 0.02).toFixed(2));
        await credit.save();

        // Send SMS
        await sendSMS(userData.phone, sendSMSTemplates(userData));
        smsSent = true;
      } catch (smsError) {
        console.error(`Error sending SMS for ${type}: `, smsError);
      }
    }
    smsSent = false;

    return { success: true, emailSent, smsSent };
  } catch (error) {
    console.error("Error sending automation: ", error);
    return { success: false, error: error.toString() };
  }
};
