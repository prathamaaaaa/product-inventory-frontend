import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown, Filter } from "lucide-react";
import ChangeLanguage from "./BUttons/ChangeLanguage";
import Filtering from "./Filtering";
import AddToCart from "./BUttons/AddToCart";
import ViewCart from "./BUttons/ViewCart";


function List({ storeId }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);
  
  function CopyUrl() {
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.set("lang", language);

    navigator.clipboard.writeText(currentURL.href)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => console.error("Error copying:", err));
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const langFromURL = params.get("lang");

    if (langFromURL) {
      i18n.changeLanguage(langFromURL);
      setLanguage(langFromURL);
      localStorage.setItem("language", langFromURL);
    }
  }, []);


  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const DEFAULT_IMAGE = "https://dummyimage.com/150x150/ccc/000.png&text=No+Image";
  const location = useLocation();
  const [copySuccess, setCopySuccess] = useState(false);
  const isAdminPanel = location.pathname.startsWith("/admin/dashboard");
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(() => {
    const storedAdmin = localStorage.getItem("admin");
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  });



  const BASE_URL = import.meta.env.VITE_BASE_URL;
  console.log("BASE_URL", BASE_URL);

  const params = new URLSearchParams(location.search);

  const user = JSON.parse(localStorage.getItem("user"));
  const cart = JSON.parse(localStorage.getItem("cart"));
  // console.log("cart lengtj",cart.length)


  // const handleLogout = () => {
  //   Swal.fire({
  //     title: t("title"),
  //     text: t("text"),
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: t("confirm"),
  //     cancelButtonText: t("cancel"),
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       localStorage.removeItem("user");
  //       Swal.fire(t("logout_title"), t("logout_message"), "success");
  //       navigate("/list");
  //     }
  //   });
  // };
  // useEffect(() => {
  //   let updatedCart = cart.map(item => {
  //     if (!item.userid) {
  //       console.log("Assigning user.id to item:", item);
  //       item.userid = user?.id || null;
  //     }
  //     return item;
  //   });
  
  //   localStorage.setItem("cart", JSON.stringify(updatedCart));
  // }, [cart, user?.id]);
  
  // const syncCartWithDatabase = async (userId) => {
  //   let cart = JSON.parse(localStorage.getItem("cart")) || [];

  //   if (!cart.userid) {
  //     console.log("yess")
      
  //   }
  //   console.log("uuuuuu", userId)

  //   if (cart.length === 0) {
  //     console.log("No items in local storage cart to sync.");
  //     return;
  //   }
    
  // //  if (!cart.userid) {
  //   const cartData = {
  //     userid: Number(user.id),
  //     cartItems: cart.map(item => ({
  //       productid: Number(item.productid),
  //       productname: String(item.productname),
  //       quantity: Number(item.quantity)
  //     }))
  //   };
  // //  }

  //   console.log("🚀 Sending cart data:", JSON.stringify(cartData, null, 2));

  //   try {


  //     const response = await fetch("http://localhost:8081/api/products/cart/bulk", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(cartData),
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error(" Failed to sync local cart with database:", errorText);
  //     } else {
  //       console.log(" Local cart synced with database successfully.");
  //     }
  //   } catch (error) {
  //     console.error(" Error sending local cart to database:", error);
  //   }
  // };



const syncCartWithDatabase = async (userId) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Only include items that had no userid before login
  const itemsToSync = cart.filter(item => item.userid === null);

  if (itemsToSync.length === 0) {
    console.log("No new items with null userid to sync.");
    return;
  }
  const p= user?.id;
  console.log(p)
  const cartData = {
    userid: Number(p),
    cartItems: itemsToSync.map(item => ({
      productid: Number(item.productid),
      productname: String(item.productname),
      quantity: Number(item.quantity)
    }))
  };

  console.log("🚀 Sending cart data:", JSON.stringify(cartData, null, 2));

 if (user?.id) {
  try {
    const response = await fetch(`${BASE_URL}/api/products/cart/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(" Failed to sync local cart with database:", errorText);
    } else {
      console.log(" Local cart synced with database successfully.");

      const updatedCart = cart.map(item =>
        item.userid === null ? { ...item, userid: userId } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  } catch (error) {
    console.error(" Error sending local cart to database:", error);
  }
 }
};





  const PreventBackOnList = () => {
    const location = useLocation();
    const isLoggedIn = localStorage.getItem("user");

    useEffect(() => {
      if (isLoggedIn && location.pathname === "/list") {
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
          window.history.pushState(null, "", window.location.href);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
          window.removeEventListener("popstate", handlePopState);
        };
      }
    }, [location.pathname, isLoggedIn]);

    return null;
  };



  useEffect(() => {
    syncCartWithDatabase();

    let url = `${BASE_URL}/api/products/all`;
    if (storeId) {
      url = `${BASE_URL}/api/stores/product/${storeId}`;
      console.log(storeId)
    }
    axios.get(url)
      .then(response => {
        console.log("API Response:", response.data);
        setProducts(response.data.products || []);
        setFilteredProducts(response.data.products || []);
        setCategories(response.data.categories || []);
        setSubCategories(response.data.subCategories || []);
        setLoading(false);
        let allProducts = response.data.products || [];
        console.log("Categories Data:", response.data.categories);
        if (storeId) {
          allProducts = allProducts.filter(product => product.storeId == storeId);
        }
        console.log("location", location.pathname);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);


  if (loading) return <p className="text-center text-lg">{t("loading")}</p>;
  if (error) return <p className="text-center text-red-500">{t("errorLoading")}</p>;

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${BASE_URL}/admin/list/${id}`)
          .then(() => {
            Swal.fire(t("deleteSuccess"), t("deleteMessage"), "success");

            setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
            setFilteredProducts((prevFiltered) => prevFiltered.filter((p) => p.id !== id));


            setTimeout(() => window.location.reload(), 1000);
          })
          .catch((error) => {
            console.error("Error deleting product:", error);
            Swal.fire("Error!", "An error occurred while deleting the item.", "error");
          });
      }
    });
  }
  const toggleProductStatus = async (productId) => {

    try {
      console.log("Toggling product status for ID:", productId);

      const response = await axios.put(`${BASE_URL}/api/products/toggle-active/${productId}`);
      console.log("Product status toggled successfully!", response.data);

      let url = `${BASE_URL}/api/products/all`;
      if (storeId) {
        url = `${BASE_URL}/api/stores/product/${storeId}`;
      }

      const updatedResponse = await axios.get(url);
      console.log("Updated Products:", updatedResponse.data);

      setProducts(updatedResponse.data.products || []);
      setFilteredProducts(updatedResponse.data.products || []);

    } catch (error) {
      console.error("Error updating product status:", error);
      alert("Failed to update product status. Please try again.");
    }
  };




  return (

    <div className="bg-[#FFF8F3] text-gray-900 min-h-screen p-8">
      <PreventBackOnList />

      {/* header sections  */}
        {(location.pathname.startsWith("/admin/") || location.pathname.startsWith("/store/")) && (
      <div className="bg-[#FDFAF6] p-6 lg:mx-10 mb-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-extrabold p-2 text-gray-800"> {t("productlist")}</h1>


        {/* <span className="text-gray-700 font-medium">Admin ID: {admin?.id || "Loading..."}</span> */}

          <Link
            to={`/add`}
            className="mt-4 md:mt-0 px-6 py-3  text-white font-semibold rounded-lg shadow-md bg-[#56021F] hover:bg-[#7D1C4A] transition"
          >
            {t("addProduct")}
          </Link>
      </div>
        )}
      {/* Search and Filter Section */}


      <Filtering t={t} storeId={storeId} categories={categories} subCategories={subCategories} products={products} isAdminPanel={isAdminPanel} admin={admin} onFilter={setFilteredProducts} />
      {/*  Product Grid */}


      <div className="mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.length > 0 ? (
          filteredProducts
            .filter(product => isAdminPanel || location.pathname.startsWith("/store/") || product.active)
            .filter(product =>
              isAdminPanel ? product.adminid == admin?.id : true
            )
            .filter(product => storeId ? parseInt(product.storeid) === parseInt(storeId) : true)

            .map(product => (

              <div key={product.id} className="bg-[#FFF2F2] p-5 rounded-xl shadow-lg transform transition hover:translate-y-[-5px] hover:shadow-2xl">
                {/* <span>{product.adminid}</span>
                <span>admin{admin?.id}</span> */}

                {/* Product Name */}
                <h2 className="text-xl font-bold text-gray-800 flex justify-between items-center">
                  <div>
                    {/* <span className="ml-2">{product.name}</span> */}
                    <span className="ml-2">
                      {JSON.parse(product.name)[language] || JSON.parse(product.name)["en"]}
                    </span>
                  </div>
                  <div>
                    {(location.pathname.startsWith("/admin/") || location.pathname.startsWith("/store/")) && (
                      <div className="flex">

                        <span title={product.active ? "Disable Product" : "Enable Product"}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth={2}
                            className="lucide cursor-pointer"
                            onClick={() => toggleProductStatus(product.id)}
                          >
                            {product.active ? (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </>
                            ) : (
                              <>
                                <path d="M17.94 17.94A10.63 10.63 0 0 1 12 20c-7 0-11-8-11-8a19.07 19.07 0 0 1 4.22-5.31" />
                                <path d="M8.53 8.53A3 3 0 0 1 12 9c.3 0 .6 0 .88-.08" />
                                <path d="M1 1l22 22" />
                              </>
                            )}
                          </svg>
                        </span>
                        <span title="Edit Product">
                          {storeId && (
                            <svg xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" viewBox="0 0 24 24"
                              onClick={() => navigate(`/add/${product.id}?storeId=${storeId}`)}
                              fill="none" stroke="currentColor" strokeWidth={2}
                              className="lucide  lucide-file-pen-line">
                              <path d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
                              <path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                              <path d="M8 18h1" />
                            </svg>
                          )}
                        </span>


                        <span title="Delete Product">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={() => handleDelete(product.id)}  // Ensure product.id is passed correctly
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="lucide text-red-600 lucide-trash-2 cursor-pointer"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>

                        </span>

                      </div>
                    )}
                    {location.pathname.startsWith("/list") && (
                 <div>
                      
                      <AddToCart language={language} product={product}  />
                 </div>
                    )}

                  </div>
                </h2>

                {/* Product Details */}
                <div className="text-sm text-gray-600 mt-3 mb-2 space-y-2">
                  <p><strong>{t("price")}</strong> {product.price}</p>
                  <p><strong>{t("category")}</strong> {product.categoryName || "N/A"}</p>
                  <p><strong>{t("subcategory")}</strong> {product.subCategoryName || "N/A"}</p>
                </div>

                {/* View Details Button */}
                <Link
                  to={isAdminPanel ? `/admin/detail/${product.id}` : `/detail/${product.id}`}
                  className="text-[#3D0301]  font-semibold hover:underline"
                >
                  {t("viewDetails")}
                </Link>

                {/* Product Image */}
                <div className="mt-4 flex justify-center">
                  {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="w-[90%] h-40 object-cover rounded-xl border-2 border-gray-300 shadow-lg transition-transform transform hover:scale-105"
                    />
                  ) : (
                    <img
                      src={DEFAULT_IMAGE}
                      alt="No Image"
                      className="w-40 h-40 object-cover rounded-xl border-2 border-gray-300 shadow-lg"
                    />
                  )}
                </div>

              </div>
            )
            )) : (
          <p className="col-span-full text-center text-gray-600 text-lg">No products found.</p>
        )}
      </div>

      <button onClick={CopyUrl} className="fixed bottom-6 right-6 bg-[#56021F] text-white text-xl p-4 rounded-full shadow-lg hover:bg-[#7D1C4A] transition transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" strokeWidth={2} viewBox="0 0 26 24" fill="none" stroke="currentColor" className="lucide  lucide-share-2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
      </button>
      {copySuccess && (
        <div className="fixed bottom-16 right-16 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg transition-opacity">
          {t("copyUrl")}        
          
          </div>
      )}

    </div>
  );
}

export default List;