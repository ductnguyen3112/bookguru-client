import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Special Note Schema

const specialNoteSchema = new Schema(
  {
    note: {
      type: String,
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt`
    _id: false, // Disable the default `_id` field
  }
);

// Client Schema
const clientSchema = new Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    clientPhone: {
      type: String,
      unique: true,
    },
    clientEmail: {
      type: String,
    },
    clientPassword: {
      type: String,
    },
    clientDOB: {
      type: Date,
    },
    reviews: {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
    appointments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    notification: {
      type: String,
      enum: ["email", "phone", "all"],
      default: "all",
    },
    reputation: {
      type: Boolean,
      default: false,
    },
    verifyCode: String,
    verifyCodeExpires: Date,
    specialNotes: [specialNoteSchema], // Embed the Special Note Schema
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` for the Client schema
);

// Pre-save validation to check for duplicate businessId in specialNotes
clientSchema.pre("save", function (next) {
  const uniqueBusinessIds = new Set(
    this.specialNotes.map((note) => note.businessId.toString())
  );
  if (uniqueBusinessIds.size !== this.specialNotes.length) {
    return next(new Error("Duplicate businessId in specialNotes"));
  }
  next();
});

const Client = mongoose.models.Client || mongoose.model("Client", clientSchema);

export default Client;
