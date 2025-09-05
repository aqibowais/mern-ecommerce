import { stripe } from "../lib/strip.js";
import Coupon from "../models/coupon.model.js";
import { config } from "dotenv";
import Order from "../models/order.model.js";

config();

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty cart" });
    }
    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); //send price in cents to stripe
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
      };
    });
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    const session = stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });
    if (totalAmount > 20000) {
      // if total amount is more than $200 then create new coupon and send it to user
      await createNewCoupon(req.user._id);
    }
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.log("Error in creating checkout session", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


export const checkoutSessionSuccess = async(req,res)=>{
  try {
    const {sessionId} = req.body;
    const session = stripe.checkout.sessions.retrieve(sessionId);

    if(session.payment_status === "paid"){
      if(session.metadata.couponCode){
        await Coupon.findOneAndUpdate({
          coupon: session.metadata.couponCode,
          userId: req.user._id,
        },{isActive: false});
      }

      //create new order
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: req.user._id,
        products:products.map(product=>({
          product:product.id,
          quantity:product.quantity,
          price:product.price
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: sessionId
      })

      await newOrder.save();
      res.status(200).json({success: true,message:"Payment successful, order created, and coupon deactivated",orderId: newOrder._id});
    }
  } catch (error) {
    console.log("Error in checkout session success", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

async function createStripeCoupon(discountPercentage) {
  const stripeCoupon = await stripe.coupons.create({
    duration: "once",
    percent_off: discountPercentage,
  });
  return stripeCoupon.id;
}

async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId,
  });
  await newCoupon.save();
  return newCoupon;
}
