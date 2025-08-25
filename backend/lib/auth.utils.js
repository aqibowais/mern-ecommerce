import jwt from "jsonwebtoken";
import { redis } from "./redis.connection.js";
export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};


export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevent xss attacks,cross site script
    secure:process.env.NODE_ENV === "production",
    sameSite:"strict", //prevent cross site request forgery attack,csrf attacks
    maxAge: 15 * 60 * 1000,
  }); //15 minutes
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //prevent xss attacks,cross site script
    secure:process.env.NODE_ENV === "production",
    sameSite:"strict", //prevent cross site request forgery attack,csrf attacks
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }); //7 days
};


export const storeRefeshTokenInRedis = async (userId, refreshToken) => {
  try {
    await redis.set(
      `refresh_token:${userId}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    ); // 7 days
  } catch (error) {
    console.log("Error in storing refresh token in redis", error.message);
  }
};
export const removeTokenFromRedis = async (userId) => {
  try {
    await redis.del(`refresh_token:${userId}`);
  } catch (error) {
    console.log("Error in removing refresh token from redis", error.message);
  }
};

export const getTokenFromRedis = async(userId) =>{
    try {
        return await redis.get(`refresh_token:${userId}`);
    } catch (error) {
        console.log("Error in getting refresh token from redis", error.message);
    }
}