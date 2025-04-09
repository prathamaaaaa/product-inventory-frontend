
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
function Detail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [quantity, setQuantity] = useState(1);
  const [cartDetails, setCartDetails] = useState([]);

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
  


  function CopyUrl() {
    const currentURL = new URL(window.location.href); // Convert to URL object
    currentURL.searchParams.set("lang", language); // Set language in URL

    navigator.clipboard.writeText(currentURL).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch((err) => console.error("Error copying:", err));
  }
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const langFromURL = params.get("lang");

    if (langFromURL) {
      i18n.changeLanguage(langFromURL);
      setLanguage(langFromURL);
      localStorage.setItem("language", langFromURL);
    }
  }, [i18n]); // Fix: Add `i18n` as a dependency

  useEffect(() => {
    axios.get(`${BASE_URL}/api/products/${id}`)
      .then(response => {
        setProduct(response.data);
        setSelectedImage(response.data.imageUrls?.[0] || "https://dummyimage.com/400x400/ccc/000.png&text=No+Image");
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching product details:", error);
        setError(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error loading product details.</p>;
  if (!product) return <p className="text-center text-gray-600">Product not found.</p>;


 
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("Initial Local Storage:", cart);
  const AddtoCart = async (id, productName , price) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let user = JSON.parse(localStorage.getItem("user")); 

    console.log("Initial Local Storage name:", productName);
    
    let updatedProduct = null;
    const existingProductIndex = cart.findIndex((item) => item.productid === id);

    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
        updatedProduct = cart[existingProductIndex];
    } else {
        updatedProduct = { productid: id, 
          productname: productName
          , quantity: 1 , price: price };
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

            const response = await fetch("http://localhost:8081/api/products/cart", {
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
    <div className="min-h-screen bg-gray-100 ">
      <div className="flex justify-between items-center p-4 pt-10 bg-gray-100 pl-10 shadow-md">
        {location.pathname.startsWith("/admin/detail/") && (
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-primary ml-[5%] hover:underline"
          >
         {t("backToList")}
          </button>
        )}

        {location.pathname.startsWith("/detail/") && (
          <button
            onClick={() => navigate(-1)}
            className="text-primary ml-[5%] hover:underline"
          >
            {t("backToList")}
          </button>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" onClick={CopyUrl} width="25" height="25"
          viewBox="0 0 26 24" fill="none" stroke="currentColor"
          className="lucide  lucide-share-2 mr-[10%]"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>

      </div>
      <div className=" flex justify-center items-center pt-10">
        <div className="bg-white rounded-lg shadow-lg w-[75%] relative overflow-hidden p-6">

          {/* Yellow Corner Design */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-400 rotate-45 -translate-x-12 -translate-y-12"></div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1  md:grid-cols-2 gap-6 items-center">

            {/* Left: Image Section */}
            <div className="flex  flex-col  items-center">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-[80%] h-80 object-cover rounded-lg shadow-md border"
              />

              {/* Thumbnails */}
              <div className="mt-4 flex-wrap justify-items-center  flex space-x-3">
                {product.imageUrls && product.imageUrls.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index}`}
                    className={`w-16 h-16 object-cover mb-2 rounded-lg  cursor-pointer transition border-2 ${selectedImage === img ? "border-yellow-500" : "border-gray-300"}`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="mb-10">
<div className="flex justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
{JSON.parse(product.name)[language] || JSON.parse(product.name)["en"]}
              </h1> 
              {(location.pathname.startsWith("/detail/")) && (

<span title="Add to Cart">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      onClick={() => {
        const localizedName =
        JSON.parse(product.name)[language] || JSON.parse(product.name)["en"];

        AddtoCart(product.id, product.name , product.price);

        toast.success(`${localizedName} added to cart!`, {
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
      className="lucide lucide-shopping-cart-icon lucide-shopping-cart"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  </span>
)}
</div>
              <p className="text-gray-600 text-sm">{product.categoryName} / {product.subCategoryName}</p>

              {/* Rating & Description */}
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-yellow-500">★★★★★</span>
                <span className="text-gray-500 text-sm">(4.5/5)</span>
              </div>
              <p className="text-sm text-gray-700 mt-2">
                {product.details}
              </p>
              {copySuccess && (
                <div className="fixed top-16 right-10 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg transition-opacity">
                  URL Copied..!!
                </div>
              )}
{/* Quantity Selector */}
{cart
  .filter((item) => item.productid === product.id)
  .map((item) => (
    <div key={item.productid} className="flex items-center justify-start space-x-3 mt-4">
      <button 
        onClick={() => updateQuantity(item.productid, -1 , product.name , product.price)}
        className="px-3 py-1 border rounded-md hover:bg-gray-200"
      >-</button>
      <span className="text-lg">{item.quantity}</span>
      <button 
        onClick={() => updateQuantity(item.productid, 1 , product.name , product.price)}
        className="px-3 py-1 border rounded-md hover:bg-gray-200"
      >+</button>
    </div>
))}

              {/* Size Selection */}
              <div className="mt-4">
                <p className="text-md font-semibold mb-1">Select Size:</p>
                <div className="flex space-x-2">
                  {["7", "8", "9", "10", "11"].map(size => (
                    <button key={size} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-yellow-400 hover:text-white transition">
                      {size}
                    </button>
                  ))}
                </div>
              </div>


              {/* Price & Buy Button */}
              <div className="mt-6 flex justify-between items-center">
                <p className="text-3xl font-bold text-gray-900">${product.price}</p>
                <button
                
                onClick={() => {
                  const selectedProduct = {
                    productid: product.id,
                    productname: product.name,
                    quantity: 1,
                    price: product.price,
                  };
              
                  navigate("/checkout", {
                    state: {
                      total: product.price,
                      selectedItems: [selectedProduct],  // pass only this product
                    },
                  });
                }}
                className="px-6 py-3 bg-orange-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-orange-600 transition">
                  {t("buy")}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;
