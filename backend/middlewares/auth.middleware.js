import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken)
      return res
        .status(401)
        .json({ message: "Unauthorized - No Access Token Provided" });

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      if (!decoded)
        return res
          .status(401)
          .json({ message: "Unauthorized - Invalid Token" });

      const user = await User.findById(decoded.userId).select("-password"); //select all fields except password

      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access Token Expired" });
      }
      throw error
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const adminRoute = (req, res, next) => {
  if(req.user && req.user.role === "admin") next();
  else return res.status(401).json({message:"Access denied - Admins only"});
}
