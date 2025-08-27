import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const res = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
    console.log(res.connection.host)
  } catch (error) {
    console.error(`We are not able to connect to DB due to ${error}`)
    process.exit(1)
  }
}

export default connectDB;