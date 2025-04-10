import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

import { toast } from "react-toastify";



function Cart() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [cartDetails, setCartDetails] = useState([]);
  const DEFAULT_IMAGE = "https://dummyimage.com/150x150/ccc/000.png&text=No+Image";
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { t, i18n } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [total, setTotal] = useState(0);

  const subtotal = Array.isArray(cartDetails) ? cartDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  // let total = subtotal + 20 - 9;; 

  
  const handleCheckout = () => {
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "You need to log in before proceeding to checkout.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth", { state: { role: "user" } });
        }
      });
    } else {
      navigate("/checkout", { state: { total , couponCode }}); // Proceed to checkout if logged in
    }
  };
  const fetchCartDetails = async () => {

    try {
        let cart = JSON.parse(localStorage.getItem("cart") || "[]"); 
        let productIds = cart.map((item) => item.productid); // Fix: Use productid

        let response = await axios.get(`${BASE_URL}/api/products/all`);
        let allProducts = response.data.products;

        let updatedCart = allProducts
            .filter((product) => productIds.includes(product.id)) // Ensure productid matches id
            .map((product) => {
                let cartItem = cart.find((item) => item.productid === product.id);
                return { ...product, quantity: cartItem.quantity };
            });

        setCartDetails(updatedCart);
    } catch (error) {
        console.error("Error fetching cart details:", error);
    }
};
  
const fetchCoupons = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/coupons/all`);
    setCoupons(res.data.filter(c => c.active == true));
    console.log("Coupons fetched:", res.data);
    
  } catch (err) {
    console.error("Failed to fetch coupons", err);
  }
};
useEffect(() => {
  console.log("Updated Coupons:", coupons);
}, [coupons]);


useEffect(() => {
  fetchCartDetails();
  fetchCoupons();
}, []);
  const updateQuantity = async (id, change  , productname, productsprice) => {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let user = JSON.parse(localStorage.getItem("user"));
  
    if (!user) {
      console.log("User not logged in. Cart stored only in local storage.");
      return;
    }
  
    const existingProduct = cart.find((item) => item.productid === id);
    if (!existingProduct) return; 
  
    existingProduct.quantity = Math.max(1, existingProduct.quantity + change);
    localStorage.setItem("cart", JSON.stringify(cart));
  
    try {
      const cartData = {
        userid: user.id ?? 0,
        productid: existingProduct.productid ?? 0,
        productname: productname|| "Unknown", 
        price: productsprice || 0,
        quantity: existingProduct.quantity ?? 1,
      };
  
      console.log("Sending cart data:", cartData);
  
      const response = await fetch("http://localhost:8081/api/products/cart", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartData),
      });
  
      if (response.ok) {
        console.log("Cart item quantity updated in database.");
        fetchCartDetails(); 
      } else {
        const errorText = await response.text();
        console.error("Failed to update cart quantity:", errorText);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };
  


  
  const deleteItem = async (id) => {

    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    let user = JSON.parse(localStorage.getItem("user"));

    // Remove item from local storage
    cart = cart.filter((item) => item.productid !== id);
    localStorage.setItem("cart", JSON.stringify(cart));

    // Update state
    setCartDetails(prevCart => prevCart.filter((item) => item.id !== id));

    if (!user) {
        console.log("User not logged in, only updating local storage.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/products/cart/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            console.log("Cart item deleted from database.");
            setDiscountPercent(0);
            setCouponCode("");
        } else {
            const errorText = await response.text();
            console.error("Failed to delete cart item:", errorText);
        }
    } catch (error) {
        console.error("Error deleting cart item:", error);
    }
};

const appliedCoupons = (code) => {
  const selected = coupons.find(c => c.code === code && c.active == true);
  if (selected) {
    setCouponCode(selected.code);
  }
};

const applyCouponFromCard = (code) => {
  const selected = coupons.find(c => c.code === code && c.active === true);

  if (!selected) {
    console.log("Invalid or inactive coupon");
    setDiscountPercent(0);
    Swal.fire("Invalid Coupon", "This coupon is not valid or has expired.", "error");
    return;
  }

  const subtotal = Array.isArray(cartDetails)
    ? cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const tempTotal = subtotal + 20 - 9; 

  if (tempTotal >= selected.minAmount) {
    setCouponCode(selected.code);
    setDiscountPercent(selected.discount);
    console.log(`Applied coupon ${selected.code}: ${selected.discount}% off`);
    Swal.fire("Coupon Applied", `You got ${selected.discount}% off!`, "success");
  } else {
    setCouponCode("");
    setDiscountPercent(0);
    Swal.fire(
      "Minimum Amount Not Met",
      `You need to spend at least ₹${selected.minAmount} to use this coupon.`,
      "warning"
    );
  }
};


useEffect(() => {
  const subtotal = Array.isArray(cartDetails)
    ? cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const shipping = 20;
  const fixedDiscount = 9;

  const discountedTotal = (subtotal + shipping - fixedDiscount) * (1 - discountPercent / 100);

  setTotal(discountedTotal);
}, [cartDetails, discountPercent]);


  return (
    <>
     <div className="bg-gray-100 w-full grid-cols-1 grid md:grid-cols-3">
     <div className="w-80% col-span-2">
      <h2 className="text-2xl justify-self-center m-16 font-semibold mb-4">{t("shoppingCart")} ({cartDetails.length} {t("items")})</h2>
      <div className="container lg:px-[5%] bg-gray-100 w-full  px-6 py-8">
  <div className=" lg:flex-row gap-8">
    
    {/* Left Side: Cart Items */}
    <div className="w-full   p-6 shadow-md rounded-lg">

      {cartDetails.length > 0 ? (
        cartDetails.map((item) => (

          <div key={`cart-item-${item.id}`} className="flex flex-col sm:flex-row justify-between items-center border-b py-4">
            {/* Image + Title */}
            <div className="flex items-center w-full sm:w-1/2">
              <img
                src={Array.isArray(item.imageUrls) && item.imageUrls.length > 0 ? item.imageUrls[0] : DEFAULT_IMAGE}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-md border"
              />
              <div className="ml-4">
                <p className="font-semibold">
                  {item.name ? JSON.parse(item.name)[language] || JSON.parse(item.name)["en"] : "Unknown Product"}
                </p>
                <p className="text-sm text-gray-500">Cotton T-shirt</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center mt-2 sm:mt-0">
              <button onClick={() => updateQuantity(item.id, -1, item.name , item.price)} className="px-2 py-1 border rounded-md">-</button>
              <span className="mx-4">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1, item.name , item.price)} className="px-2 py-1 border rounded-md">+</button>
            </div>

            {/* Price */}
            <div className="mt-2 sm:mt-0 text-center w-20 font-medium">₹{item.price}</div>

            {/* Delete */}
            <div className="mt-2 sm:mt-0 text-center w-8">
              <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-700 text-lg">×</button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center py-6 text-gray-500">{t("cartEmpty")}</p>
      )}
      <button onClick={() => navigate("/list")} className="mt-6 text-sm text-black hover:underline">&larr; {t("backToShop")}</button>
    </div>

    {/* Right Side: Summary */}
    <div className="w-full  mt-10 bg-gray-300 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">{t("summary")}</h3>
      {/* Item breakdown */}
  {cartDetails.map((item) => (
    <div key={item.id} className="flex justify-between text-sm text-gray-700 mb-2">
      <span>
        {item.quantity} × {item.name ? JSON.parse(item.name)[language] || JSON.parse(item.name)["en"] : "Product"}
      </span>
      <span>₹ {(item.price * item.quantity).toFixed(2)}</span>
    </div>
  ))}
      <div className="flex justify-between mb-2">
        <span>{t("shipping")}</span>
        <span>₹20.00</span>
      </div>
      <div className="flex justify-between mb-4">
        <span>{t("discount")}</span>
        <span>- ₹9.00</span>
      </div>
      <div className="border-t border-gray-300 my-4"></div>
    

  <div className="grid grid-cols-3">
  <input
        type="text"
        placeholder={t("enterCode")}
        value={couponCode}
        className="col-span-2 px-4 py-2 border rounded-md"
      />
      <button onClick={()=>applyCouponFromCard(couponCode)} className=" bg-black text-white rounded-sm mx-2 ">Apply Coupon</button>
  </div>
  <div className="flex justify-between mt-4 text-lg font-semibold">
        <span>{t("totalPrice")}</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
      <button
        className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
        onClick={handleCheckout}
      >
        {t("checkout")}
      </button>
    </div>
  </div>


</div>
      </div>
<div className="mt-8 text-center ">
<div className="mt-8 px-6 py-6 bg-white">

  <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Coupons</h3>
  <div className="space-y-4">
  {coupons.map((coupon, index) => {
    const isDisabled = coupon.usercount > 10;

    return (
      <div
        key={index}
        onClick={() => {
          if (isDisabled) return; 
          appliedCoupons(coupon.code);
          toast.success(`${coupon.code} applied!`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }}
        className={`relative flex justify-between items-center px-6 py-4 shadow-md overflow-hidden transition duration-200 
          ${index % 3 === 0 ? "bg-red-500" : index % 3 === 1 ? "bg-yellow-500" : "bg-cyan-600"} 
          ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "text-white cursor-pointer"}
        `}
      >
        <div>
        <span className="text-xl font-bold uppercase">{coupon.discount}% OFF</span>
<span className="text-sm">Use Code: <strong>{coupon.code}</strong></span>
<span className="text-sm">Valid Until {coupon.expiry || "25 March 2025"}</span>
        </div>
      </div>
    );
  })}
</div>

</div>


  </div>
     </div>
    </>
  );
}

export default Cart;
