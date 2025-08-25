import mongoose from "mongoose";
export const connectDB = async () => {
  const dbUrl = process.env.MONGOURI || "";
  
  try {
    await mongoose
      .connect(dbUrl)
      .then((conn) =>
        console.log(`mongodb connected with : ${conn.connection.host}`)
      );
  } catch (error) {
    console.log(`[Error]: ${error}`);
  }
};
