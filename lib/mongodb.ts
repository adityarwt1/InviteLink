import mongoose from "mongoose";

export const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "InviteLink",
    });
  } catch (error) {
    console.log((error as Error).message);
  }
};
