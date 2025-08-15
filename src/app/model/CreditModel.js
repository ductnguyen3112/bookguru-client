import mongoose from "mongoose";

const Schema = mongoose.Schema;

const creditTransactionSchema = new Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    required: true,
  },
});

const creditSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    creditName: {
        type: String,
        required: true,
    },
    businessId: {
        type: Schema.Types.ObjectId,
        ref: "Business",
        required: true,
    },
    credits: {
        type: Number,
        default: 0,
        required: true,
    },
    transactions: [creditTransactionSchema],
});


const Credit = mongoose.models.credits || mongoose.model("credits", creditSchema);

export default Credit;
