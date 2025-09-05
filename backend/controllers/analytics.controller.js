import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments({ role: "customer" });
  const totalProducts = await Product.countDocuments({});
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };
  return {
    users: totalUsers,
    products: totalProducts,
    totalSales: totalSales,
    totalRevenue: totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // sample output
    // [
    //     {
    //         "_id": "2023-09-01",
    //         "totalSales": 2,
    //         "totalRevenue": 100
    //     },
    // ]

    const dateArray = getDatesInRange(startDate, endDate);
    // console.log(dateArray); // ['2023-09-01', '2023-09-02',...]

    return dateArray.map((item) => {
      const foundData = dailySalesData.find((data) => data._id === item);
      return {
        date: item,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (error) {
    console.log("Error in getting daily sales data", error.message);
    throw error;
  }
};

function getDatesInRange(startDate, endDate) {
  const dateArray = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateArray.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}
