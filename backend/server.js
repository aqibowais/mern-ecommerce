import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import { connectDB } from "./lib/db.connection.js";
// import cors from "cors"



dotenv.config()

const port = process.env.PORT || 5000;

const app = express()


//middlewares
app.use(express.json({ limit: '10mb' })) // Increase payload limit to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
// app.use(cors({
//   origin:"http://localhost:5173",
//   credentials:true
// }))



//routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);


app.listen(port,()=>{
    console.log("server is running on port ",port)
    connectDB()
})