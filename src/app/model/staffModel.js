import mongoose from "mongoose";
import workHourSchema from "./businessModel";
const Schema = mongoose.Schema;

const staffScheduleSchema = new Schema(
  {
    start: {
      type: String,
      default: "00:00",
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates 24-hour format time
    },
    end: {
      type: String,
      default: "00:00",
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Same validation
    },
    isWork: {
      // New field indicating if the business is open on this day
      type: Boolean,
      default: true, // Assume open unless specified
    },
  },
  { _id: false }
);

const staffSchema = new Schema({
  businessId: {
    type: String,
    required: true,
  },

  staffName: {
    type: String,
    required: true,
  },
  staffProfession: {
    type: String,
    required: true,
  },

  staffEmail: {
    type: String,
    required: true,
  },

  staffPassword: {
    type: String,
  },

  staffPhone: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
  staffNote: {
    type: String,
  },
  staffRole: {
    enum: ["manager", "staff"],
    default: "staff",
    type: String,
  },

  staffSchedule: {
    Sunday: staffScheduleSchema,
    Monday: staffScheduleSchema,
    Tuesday: staffScheduleSchema,
    Wednesday: staffScheduleSchema,
    Thursday: staffScheduleSchema,
    Friday: staffScheduleSchema,
    Saturday: staffScheduleSchema,
  },
});

const Staff = mongoose.models.staff || mongoose.model("staff", staffSchema);
export default Staff;
