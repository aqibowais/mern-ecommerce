import express from "express"
import { handleUserLogin, handleUserLogout, handleUserSignup,handleUpdateProfileImage, checkAuth, handleUserRefreshToken } from "../controllers/auth.controller.js"
import {protectRoute} from "../middlewares/auth.middleware.js"

const router = express.Router()


router.post("/signup",handleUserSignup)
router.post("/login",handleUserLogin)
router.post("/logout",handleUserLogout)
router.post("/refresh-token",handleUserRefreshToken)
// router.get("/getProfile",protectRoute,getUserProfile)


// router.put("/update-profile",protectRoute,handleUpdateProfileImage)

// router.get("/check",protectRoute,checkAuth) //for checking auth on refreshing pages etc

export default router