import express from "express"
import { handleUserLogin, handleUserLogout, handleUserSignup,getUserProfile, handleUserRefreshToken } from "../controllers/auth.controller.js"
import {protectRoute} from "../middlewares/auth.middleware.js"

const router = express.Router()


router.post("/signup",handleUserSignup)
router.post("/login",handleUserLogin)
router.post("/logout",handleUserLogout)
router.post("/refresh-token",handleUserRefreshToken)
router.get("/getProfile",protectRoute,getUserProfile)


export default router