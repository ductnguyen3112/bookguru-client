import mongoose from "mongoose";
const Schema = mongoose.Schema;

const verificationCodeSchema = new Schema({
  
    phoneNumber: {
      type: String,
      required: true,
      unique: true, // Ensures each phone number only has one entry at a time
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      required: true,
      default: 0, // Sets a default limit of 3 attempts
    },
    
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(+new Date() + 5 * 60 * 1000), // Sets a default expiry of 5 minutes from creation
    },
  },
  { timestamps: true }
);

// Index to automatically remove the document after expiration
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Verify = mongoose.models.verification || mongoose.model("verification", verificationCodeSchema);


export default Verify;
