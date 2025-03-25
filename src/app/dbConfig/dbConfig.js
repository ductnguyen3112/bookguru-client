import mongoose from "mongoose";

export async function connect() {
  try {
    mongoose.connect(process.env.MONGO_URI);

    const connection = mongoose.connection;
    connection.on("connected", () => {
      // Connection established successfully.
    });
    connection.on("error", (err) => {
      // Handle connection errors.
      process.exit(1);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit with a failure code.
  }
}
