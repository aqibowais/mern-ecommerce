import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const useProductStore = create((set,get)=>({
    products: [],
    loading:false,
    setProducts:(products)=>set({products}),
    createProduct:async(productData)=>{
        set({loading:true})
        try {
            const res = await axiosInstance.post("/products",productData);
            set((prevState)=>({
                products:[...prevState.products,res.data],
                loading:false,
            }))
            toast.success("Product created successfully");
        } catch (error) {
            toast.error(error.response.data.message || "Error in creating product");
            set({loading:false})
        }
    },
    fetchAllProducts:async()=>{
        set({loading:true})
        try {
            const res = await axiosInstance.get("/products");
            set({products: res.data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), loading: false})
            console.log("fetched products",get().products);
        } catch (error) {
            toast.error(error.response.data.message || "Error in Loading products");
            set({loading:false})
        }
    },
    fetchProductsByCategory:async(category)=>{
      set({loading:true})
      try {
        const res = await axiosInstance.get(`/products/category/${category}`);
        set({products:res.data.products,loading:false})
        console.log("setted loading to false in fetchProductsByCategory",get().loading);
      } catch (error) {
        toast.error(error.response.data.message || "Error in Loading products");
        set({loading:false})
        
      }  
    },
    deleteProduct:async(id)=>{
        set({loading:true})
        try {
            const res = await axiosInstance.post(`/products/${id}`);
            set((prevState)=>({
                products:prevState.products.filter(product=>product._id!==id),
                loading:false
            }))
            toast.success("Product deleted successfully");
        } catch (error) {
            toast.error(error.response.data.message || "Error in deleting product");
            set({loading:false})
            
        }
    },
    toggleFeaturedProduct:async(id)=>{
        set({loading:true})
        try {
            const response = await axiosInstance.patch(`/products/${id}`);
            set((prevState)=>({
                products:prevState.products.map(product=>product._id===id?{...product,isFeatured:response.data.isFeatured}:product),
                loading:false
            }))
            toast.success("Product featured successfully");
        } catch (error) {
            toast.error(error.response.data.message || "Error in updating product");
            set({loading:false})
        }
    }
}))