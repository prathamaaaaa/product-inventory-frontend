import React from 'react'
import { toast } from "react-toastify";

function AddToCart({ product, language }) {
  const BASE_URL = import.meta.env.VITE_BASE_URL;



    const AddtoCart = async (id, productName, price) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
        let user = JSON.parse(localStorage.getItem("user"));
    
        console.log("Initial Local Storage name:", productName);
    
        let updatedProduct = null;
        const existingProductIndex = cart.findIndex(
          (item) => item.productid === id && item.userid === (user?.id ?? null)
        );    
        if (existingProductIndex !== -1) {
          cart[existingProductIndex].quantity += 1;
          updatedProduct = cart[existingProductIndex];
        } else {
          updatedProduct = {
            productid: id,
            productname: productName
            , quantity: 1,
             price: price,
             userid: user ? user.id : null
          };
          cart.push(updatedProduct);
        }
        console.log("Initial Local Storage name:", productName);
    
        localStorage.setItem("cart", JSON.stringify(cart));
    
        console.log("Updated Local Storage:", JSON.parse(localStorage.getItem("cart")));
    
        if (user && user.id) {
          try {
            const cartData = {
              userid: user.id,
              productid: updatedProduct.productid,
              productname: productName,
              quantity: updatedProduct.quantity
            };
    
            const response = await fetch(`${BASE_URL}/api/products/cart`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(cartData),
            });
    
            if (response.ok) {
              console.log("Cart item saved in database successfully.");
            } else {
              console.error("Failed to save cart item in database.");
            }
          } catch (error) {
            console.error("Error sending cart item to database:", error);
          }
        } else {
          console.log("User not logged in. Cart stored only in local storage.");
        }
      };
    
  
    

  return (
    <div>
         <span title="Add to Cart">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 576 512"
                          onClick={() => {
                            const localizedName =
                              JSON.parse(product.name)[language] || JSON.parse(product.name)["en"];

                            AddtoCart(product.id, product.name, product.price);

                            toast.success(`${localizedName} added to cart!`, {
                              position: "top-center",
                              autoClose: 2000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              theme: "light",
                            });
                          }}
                          className="w-6 h-6 fill-current text-gray-800 cursor-pointer"
                        >
                          <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM252 160c0 11 9 20 20 20l44 0 0 44c0 11 9 20 20 20s20-9 20-20l0-44 44 0c11 0 20-9 20-20s-9-20-20-20l-44 0 0-44c0-11-9-20-20-20s-20 9-20 20l0 44-44 0c-11 0-20 9-20 20z" />
                        </svg>


                      </span>
    </div>
  )
}

export default AddToCart