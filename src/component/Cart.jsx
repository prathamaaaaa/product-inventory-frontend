import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
function Cart() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [cartDetails, setCartDetails] = useState([]);
  const DEFAULT_IMAGE = "https://dummyimage.com/150x150/ccc/000.png&text=No+Image";
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleCheckout = () => {
    if (!user) {
      // Show alert if user is not logged in
      Swal.fire({
        title: "Login Required",
        text: "You need to log in before proceeding to checkout.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth", { state: { role: "user" } }); // Redirect to login page
        }
      });
    } else {
      navigate("/checkout"); // Proceed to checkout if logged in
    }
  };
  const fetchCartDetails = async () => {
    try {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]"); // Ensure cart is always an array
      let productIds = cart.map((item) => item.id);

      let response = await axios.get(`${BASE_URL}/api/products/all`);
      let allProducts = response.data.products;

      let updatedCart = allProducts
        .filter((product) => productIds.includes(product.id))
        .map((product) => {
          let cartItem = cart.find((item) => item.id === product.id);
          return { ...product, quantity: cartItem.quantity };
        });

      setCartDetails(updatedCart);
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };
  useEffect(() => {
    

    fetchCartDetails();
  }, []);
  

  const updateQuantity = (id, change) => {
    setCartDetails((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      );
  
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      fetchCartDetails();
      return updatedCart; 
    });
  };
  
  
  const deleteItem = async (id) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]"); 
    console.log("cart1",cart)
    cart = cart.filter((item) => item.id !== id);
    console.log("cart1",cart)
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("cart1",cart)
    setCartDetails(cart);
    console.log("cart2",cart)
    fetchCartDetails();
  };
  
    
    const subtotal = Array.isArray(cartDetails) ? cartDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    const total = subtotal + 20;
    
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Shopping Cart</h2>

      {/* Cart Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Product</th>
              {/* <th className="p-4 text-center">Size</th> */}
              <th className="p-4 text-center">Quantity</th>
              <th className="p-4 text-center">Price</th>
              <th className="p-4 text-center"></th>
            </tr>
          </thead>
          <tbody>
          {Array.isArray(cartDetails) && cartDetails.length > 0 ? (
              cartDetails.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 flex items-center">
                    <img
                      src={Array.isArray(item.imageUrls) && item.imageUrls.length > 0 ? item.imageUrls[0] : DEFAULT_IMAGE}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-md"
                    />
                    <div className="ml-4">
                      <p className="font-semibold">
                      {item.name ? JSON.parse(item.name)[language] || JSON.parse(item.name)["en"] : "Unknown Product"}
                      </p>
                      <p className="text-sm text-gray-500">Product ID: {item.id}</p>
                    </div>
                  </td>
                  {/* <td className="p-4 text-center">{item.size || "M"}</td> */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center    pace-x-3">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-3 mr-4 py-1 border rounded-md hover:bg-gray-200"
                      >-</button>
                      <span className="mr-4 text-lg">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-3 py-1 border rounded-md hover:bg-gray-200"
                      >+</button>
                    </div>
                  </td>
                  <td className="p-4 text-center">${item.price}</td>
                  <td className="p-4 text-center">
                    <button onClick={() =>{deleteItem(item.id)}} className="text-red-500 text-xl hover:text-red-700">×</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">Cart is empty</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cart Summary */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between text-lg">
          <div>
            <p>Discount: <span className="font-semibold">₹0.00</span></p>
            <p>Delivery: <span className="font-semibold">₹20.00</span></p>
          </div>
          <div>
            <p>Subtotal: <span className="font-semibold">₹{subtotal.toFixed(2)}</span></p>
            <p className="text-xl font-bold">Total: ₹{total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button onClick={()=>navigate("/list")} className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">Back to Shop</button>
        <button onClick={handleCheckout} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Checkout</button>
      </div>
    </div>
  );
}

export default Cart;
