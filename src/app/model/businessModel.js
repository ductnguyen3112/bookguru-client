import mongoose from "mongoose";

const Schema = mongoose.Schema;

export const subcriptionSchema = new Schema({
  sms: {
    type: Boolean,
    default: false,
  },
});

export const categorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categoryColor: {
    type: String,
  },
  categoryNote: {
    type: String,
  },

  categoryServices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "service",
      // required: true,
    },
  ],
});

export const calendarSettings = new Schema(
  {
    showCancel: {
      type: Boolean,
      default: false,
    },
    showWork: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

export const serviceSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true, // This ensures that services have a consistent _id field unless you manually specify one.
  },
  serviceName: {
    type: String,
    // required: true,
  },
  created: {
    type: Date,
    default: Date.now,
    // required: true,
  },
  duration: {
    type: Number,
    // required: true,
  },
  price: {
    type: String,
    required: true,
  },
  flex: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },
  show: {
    type: Boolean,
    default: true,
  },
  staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "staff",
      // required: true,
    },
  ],
  category: {
    type: String,
    // required: true,
  },
});

export const catalogueSchema = new Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categoryColor: {
    type: String,
    default: "#FFBF69",
  },
  categoryNote: {
    type: String,
  },

  categoryServices: [serviceSchema],
});

export const workHourSchema = new Schema(
  {
    open: {
      type: String,
      default: "00:00",
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates 24-hour format time
    },
    close: {
      type: String,
      default: "00:00",
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Same validation
    },
    isOpen: {
      // New field indicating if the business is open on this day
      type: Boolean,
      default: true, // Assume open unless specified
    },
  },
  { _id: false }
);

export const automationSchema = new Schema(
  {
    new: {
      type: String,
      enum: ["phone", "email", "all", "none"],
      default: "email",
    },
    reminder: {
      type: String,
      enum: ["phone", "email", "all", "none"],
      default: "none",
    },
    update: {
      type: String,
      enum: ["phone", "email", "all", "none"],
      default: "none",
    },
    cancel: {
      type: String,
      enum: ["phone", "email", "all", "none"],
      default: "none",
    },
    finish: {
      type: String,
      enum: ["phone", "email", "all", "none"],
      default: "none",
    },
    rebook: {
      type: String,
      enum: ["phone", "email", "all", "none"],
      default: "none",
    },
  },
  { _id: false }
);

const businessSchema = new Schema({
  businessName: {
    type: String,
    required: true,
  },

  businessAddress: {
    type: String,
    required: true,
  },

  businessPhone: {
    type: String,
    required: true,
  },

  businessEmail: {
    type: String,
    required: true,
  },

  businessDomain: {
    type: String,
  },
  businessCategory: {
    type: String,
  },
  businessTimezone: {
    type: String,
  },
  businessLogo: {
    type: String,
  },
  businessCover: {
    type: String,
  },
  businessDescription: {
    type: String,
  },
  photos: [
    {
      type: String,
    },
  ],

  customers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  blocked: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  reviewURL: {
    type: String,
  },

  businessURL: {
    type: String,
  },
  googleURL: {
    type: String,
  },
  ownerId: {
    // camelCased
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  workHours: {
    Sunday: workHourSchema,
    Monday: workHourSchema,
    Tuesday: workHourSchema,
    Wednesday: workHourSchema,
    Thursday: workHourSchema,
    Friday: workHourSchema,
    Saturday: workHourSchema,
  },
  bookRange: {
    type: Number,
    default: 30,
  },

  catalogue: [catalogueSchema],

  staffOptions: {
    type: Boolean,
    default: true,
  },

  automation: automationSchema,
  subscriptions: subcriptionSchema,
  calendar: calendarSettings,
});

const Business =
  mongoose.models.business || mongoose.model("business", businessSchema);

export default Business;
