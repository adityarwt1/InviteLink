import mongoose, { Document, Schema } from "mongoose";

interface User extends Document {
  username: string;
  password: string;
  referal: string;
  profilePicture: string;
}

const userschema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "please provide the username"],
  },
  profilePicture: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "please provide the password"],
  },
  referal: {
    type: String,
  },
});

const User = mongoose.models.User || mongoose.model<User>("User", userschema);
export default User;
