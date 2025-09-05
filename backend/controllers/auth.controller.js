import jwt from "jsonwebtoken";
import {
  generateTokens,
  setCookies,
  storeRefeshTokenInRedis,
  removeTokenFromRedis,
  getTokenFromRedis,
} from "../lib/auth.utils.js";
import User from "../models/user.model.js";
export const handleUserSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters " });

    const userExists = await User.findOne({ email });

    if (userExists)
      return res.status(400).json({ message: "User already registered" });

    //authenticate
    const newUser = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(newUser._id);
    await storeRefeshTokenInRedis(newUser._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res
      .status(500)
      .json({ message: `Internal server error : ${error.message}` });
  }
};

export const handleUserLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefeshTokenInRedis(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res
      .status(500)
      .json({ message: `Internal server error : ${error.message}` });
  }
};

export const handleUserLogout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await removeTokenFromRedis(decode.userId);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res
      .status(500)
      .json({ message: `Internal server error : ${error.message}` });
  }
};

export const handleUserRefreshToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Refresh Token Provided" });
    }

    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = getTokenFromRedis(decode.userId);

    if (storedToken !== refreshToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid Refresh Token" });
    }

    const accessToken = jwt.sign(
      { userId: decode.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true, //prevent xss attacks,cross site script
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", //prevent cross site request forgery attack,csrf attacks
      maxAge: 15 * 60 * 1000,
    }); //15 minutes

    res.status(200).json({ message: "Token Refreshed Successfully" });
  } catch (error) {
    console.log("Error in refresh token controller", error.message);
    res
      .status(500)
      .json({ message: `Internal server error : ${error.message}` });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = req.user; //as already set in protectRoute middleware
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getting user profile", error.message);
    res
      .status(500)
      .json({ message: `Internal server error : ${error.message}` });
  }
};
