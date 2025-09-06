import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  getCartItems: async () => {
    try {
      const res = await axiosInstance.get("/cart");
      set({ cart: res.data });
      console.log("cart items", res.data);
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message || "Error in getting cart items");
    }
  },
  addToCart: async (product) => {
    try {
      const res = await axiosInstance.post("/cart", { productId: product._id });
      toast.success("Product added to cart");

      set((prevState) => {
        const existingProduct = prevState.cart.find(
          (item) => item.productId === product._id
        );
        const newCart = existingProduct
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : get().getCartItems()

        return { cart: newCart };
      });
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message || "Error in adding to cart");
    }
  },
  removeFromCart: async (productId) => {
    try {
         await axiosInstance.delete(`/cart`, { data: { productId } });
    set((prevState) => ({
      cart: prevState.cart.filter((item) => item._id !== productId),
    }));
    toast.success("Product removed from cart");
    get().calculateTotals();

    } catch (error) {
      toast.error(error.response.data.message || "Error in removing from cart");
    }

  },
  clearCart:  () => {
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });

  },
  updateQuantity: async (productId, quantity) => {
    if(quantity===0){
        get().removeFromCart(productId)
        return
    }
    try {
        await axiosInstance.put(`/cart/${productId}`, { quantity });
        set((prevState)=>({
            cart:prevState.cart.map((item)=>(item._id===productId?{...item,quantity}:item))
        }))
        get().calculateTotals();
    } catch (error) {
        
    }
  },
  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subtotal;

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    set({ subtotal, total });
  },
}));
