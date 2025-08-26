import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({_id:{$in: req.user.cartItems}});
        //add quantity to each product
        const cartItemsWithQuantity = products.map((product) => {
            const quantity = req.user.cartItems.filter((item) => item.id === product._id).length;
            return {...product.toObject(), quantity};
        })
        res.status(200).json({cartItemsWithQuantity});
    } catch (error) {
        console.log("Error in getting cart products", error.message);
        res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
    }
};


export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in adding to cart", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (user.cartItems.includes(productId)) {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in remove all from cart", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.status(200).json(user.cartItems);
      }
      existingItem.quantity = quantity;
      await user.save();
      res.status(200).json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updating quantity", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
