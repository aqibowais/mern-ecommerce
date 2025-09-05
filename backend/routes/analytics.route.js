import express from "express";
import {
  getAnalyticsData,
  getDailySalesData,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.status(200).json({ analyticsData, dailySalesData });
  } catch (error) {
    console.log("Error in getting analytics data", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

export default router;
