import nodemailer from "nodemailer";
import twilio from "twilio";

// Utility functions
export const generateCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Confirmation SMS
export const confirmationSMS = (emailData) => {
  return `Appointment #${emailData.code} at ${emailData.business} on ${emailData.time}. ${emailData.address}. Edit: bookguru.io/v1/client`;
};

// SMS Templates
export const sendSMSTemplates = (emailData) => {
  let message = "";

  switch (emailData.notification) {
    case "new":
      message = `Appointment ${emailData.code} at ${emailData.business} on ${emailData.time}. Edit: bookguru.io/v1/client`;
      break;
    case "update":
      message = `Appointment ${emailData.code} rescheduled at ${emailData.business} to ${emailData.time}.Edit: bookguru.io/v1/client`;
      break;
    case "cancel":
      message = `Appointment ${emailData.code} at ${emailData.business} cancelled. Edit: bookguru.io/v1/client`;
      break;
    default:
      throw new Error("Invalid update type");
  }

  return message;
};

// Email Template generator
export const generateEmailTemplate = (emailData) => {
  let subject = "";
  let headerTitle = "";
  let message = "";
  let buttonLabel = "Manage Reservation";
  let buttonLink = "https://bookguru.io/v1/client";
  let headerColor = "#4A90E2"; // Default color for confirmation

  switch (emailData.notification) {
    case "new":
      subject = `Reservation #${emailData.code} Confirmation at ${emailData.time}`;
      headerTitle = "Reservation Confirmed";
      message = `Your reservation (#${emailData.code}) has been successfully booked with <strong>${emailData.business}</strong>.`;
      break;
    case "update":
      subject = `Reservation #${emailData.code} Rescheduled to ${emailData.time}`;
      headerTitle = "Reservation Rescheduled";
      message = `We wanted to let you know that your reservation (#${emailData.code}) with <strong>${emailData.business}</strong> has been rescheduled.`;
      headerColor = "#FFA500"; // Orange for rescheduled
      buttonLabel = "Confirm New Time";
      break;
    case "cancel":
      subject = `Reservation #${emailData.code} Cancelled`;
      headerTitle = "Reservation Cancelled";
      message = `We regret to inform you that your reservation (#${emailData.code}) with <strong>${emailData.business}</strong> has been cancelled.`;
      headerColor = "#FF0000"; // Red for cancellation
      buttonLabel = "Contact Us";
      break;
    default:
      throw new Error("Invalid update type");
  }

  return {
    email: emailData.email,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${headerTitle}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 20px;
              }
              .email-container {
                  max-width: 600px;
                  margin: auto;
                  background: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .header {
                  background-color: ${headerColor};
                  color: #ffffff;
                  padding: 20px;
                  text-align: center;
              }
              .content {
                  padding: 30px;
                  text-align: center;
              }
              .content h2 {
                  color: #333333;
                  margin: 0 0 20px;
              }
              .content p {
                  color: #777777;
                  line-height: 1.6;
              }
              .appointment-info {
                  margin: 20px 0;
                  font-size: 16px;
                  color: #333333;
              }
              .appointment-info strong {
                  color: ${headerColor};
              }
              .contact-info {
                  color: #333333;
                  margin: 20px 0;
              }
              .contact-info a {
                  color: #4A90E2;
                  text-decoration: none;
              }
              .button {
                  display: inline-block;
                  padding: 15px 30px;
                  margin: 20px 0;
                  background-color: #8CC63F;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  transition: background-color 0.3s;
              }
              .button:hover {
                  background-color: #7BB62F;
              }
              .footer {
                  padding: 20px;
                  text-align: center;
                  background-color: #f4f4f4;
                  color: #777777;
                  font-size: 12px;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <h1>${headerTitle}</h1>
              </div>
              <div class="content">
                  <h2>Hi ${emailData.client || "Client"},</h2>
                  <p>${message}</p>
                  <p>Here are your reservation details:</p>
                  <div class="appointment-info">
                      Reservation Code: <strong>${emailData.code}</strong><br>
                      Time: <strong>${emailData.time}</strong><br>
                      Address: ${emailData.address}<br>
                      Phone: ${emailData.contact}
                  </div>
                  <p>If you have any questions or concerns, please don't hesitate to get in touch with us.</p>
                  <div class="contact-info">
                      You can manage your reservation <a href="${buttonLink}">here</a>.
                  </div>
                  <a href="${buttonLink}" class="button">${buttonLabel}</a>
              </div>
              <div class="footer">
                  Thank you for choosing ${emailData.business}.<br>
              </div>
          </div>
      </body>
      </html>
    `,
  };
};

// Send Email
export const sendEmail = async (emailData) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.titan.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NODEMAIL,
      pass: process.env.NODEPASS,
    },
  });

  const emailTemplate = generateEmailTemplate(emailData);

  await transporter.sendMail({
    from: process.env.NODEMAIL,
    to: emailTemplate.email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  });
};

// Send SMS
export const sendSMS = async (phone, message) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

// Send Admin notification email to business
export const sendAdminNotification = async ({
  business,
  appointment,
  client,
  staffMember,
  services = [],
  bookTime,
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.titan.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAIL,
        pass: process.env.NODEPASS,
      },
    });

    const servicesList = Array.isArray(services)
      ? services
          .map((s) => s.serviceName || s.name || s.service || "")
          .filter(Boolean)
          .join(", ")
      : "";

    const subject = `New Appointment Notification at ${bookTime}`;
    const html = `
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; }
          .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
          .content p { font-size: 16px; }
          .button { padding: 10px 20px; font-size: 16px; color: white; background-color: #4CAF50; border-radius: 5px; text-decoration: none; margin-top: 20px; display:inline-block }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">New Appointment Booked</div>
          <div class="content">
            <p>Hello ${business.businessName || "Administrator"},</p>
            <p>A new appointment has been booked. Details below:</p>
            <p><strong>Client:</strong> ${
              client?.clientName || client?.name || "N/A"
            }</p>
            <p><strong>Phone:</strong> ${
              client?.clientPhone || client?.phone || "N/A"
            }</p>
            <p><strong>Email:</strong> ${
              client?.clientEmail || client?.email || "N/A"
            }</p>
            <p><strong>Appointment Time:</strong> ${bookTime}</p>
            <p><strong>Staff Member:</strong> ${
              staffMember?.staffName || staffMember?.name || "N/A"
            }</p>
            <p><strong>Services:</strong> ${servicesList || "N/A"}</p>
            <p><strong>Status:</strong> ${appointment?.status || "N/A"}</p>
            <p><strong>Appointment Code:</strong> ${
              appointment?.code || "N/A"
            }</p>
            <a href="https://bookguru.io/dashboard/calendar" class="button">View Appointment</a>
          </div>
          <div class="footer">Regards,<br/>bookguru.io</div>
        </div>
      </body>
      </html>
    `;

    const to = business.businessEmail || business.email || process.env.NODEMAIL;

    await transporter.sendMail({
      from: process.env.NODEMAIL,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("sendAdminNotification error:", err);
    throw err;
  }
};
