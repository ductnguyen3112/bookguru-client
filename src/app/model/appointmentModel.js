import mongoose from "mongoose";
import { serviceSchema } from "./businessModel";

const Schema = mongoose.Schema;

const locationSchema = new Schema(
  {
    business: {
      type: String,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    website: {
      type: String,
    },
    url: {
      type: String,
    },
    logo: {
      type: String,
    },
  },
  { _id: false }
);

const appointmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  services: [serviceSchema],
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  total: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  note: {
    type: String,
  },
  preference: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    enum: ["user", "staff", "admin"],
    default: "user",
  },
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  type: {
    type: String,
    enum: ["walk-in", "block", "appointment"],
    default: "appointment",
  },
  color: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "canceled", "noshow"],
    default: "approved",
  },
  location: locationSchema,
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
    index: true,
  },
  code: {
    type: String,
    unique: true,
  },
});

// Function to generate a random 6-character reservation code
function generateCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Middleware to check for duplicates and regenerate the code if needed
appointmentSchema.pre("save", async function (next) {
  let codeExists = true;

  // If the code field is not set, generate one
  if (!this.code) {
    this.code = generateCode();
  }

  // Keep checking until a unique code is found
  while (codeExists) {
    const existingAppointment = await mongoose.models.appointment.findOne({
      code: this.code,
    });
    if (!existingAppointment) {
      codeExists = false; // No duplicate found, exit the loop
    } else {
      // Duplicate found, generate a new code
      this.code = generateCode();
    }
  }

  next();
});

const Appointment =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default Appointment;
