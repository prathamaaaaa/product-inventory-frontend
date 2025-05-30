import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import DownloadCSVButton from "./BUttons/DownloadCSVButton";


function Store() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  const [admin, setAdmin] = useState(null);
  const [stores, setStores] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [storeProducts, setStoreProducts] = useState({});

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      const parsedAdmin = JSON.parse(storedAdmin);
      setAdmin(parsedAdmin.id);
    }
  }, []);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("admin"))?.token; 
    console.log("Token:", token);
    if (admin) {
      axios.get(`${BASE_URL}/api/stores/admin/${admin}`)
        .then((response) => {
          if (Array.isArray(response.data)) {
            setStores(response.data);

             response.data.forEach((store) => {
              axios.get(`${BASE_URL}/api/stores/product/${store.id}`)
                .then((productResponse) => {
                  setProductCounts((prevCounts) => ({
                    ...prevCounts,
                    [store.id]: productResponse.data.products ? productResponse.data.products.length : 0,
                  }));
  
                  // Step 3: Save products in the state
                  setStoreProducts((prevProducts) => ({
                    ...prevProducts,
                    [store.id]: productResponse.data.products || [],
                  }));
                })
                .catch((error) => console.error(`Error fetching product count for Store ${store.id}:`, error));
            });
          } else {
            console.error("Unexpected response format for stores:", response.data);
          }
        })
        .catch((error) => console.error("Error fetching stores:", error));
    }
  }, [admin]);

  function CopyUrl(storeId) {
    const storeUrl = new URL(`${window.location.origin}/store/${storeId}`); 
    storeUrl.searchParams.set("lang", language);
  
    navigator.clipboard.writeText(storeUrl.toString())
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
  }, [i18n]);

  const handleDeleteStore = (storeId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the store and all its products!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${BASE_URL}/api/stores/delete/${storeId}`)
          .then(() => {
            Swal.fire("Deleted!", "The store has been deleted.", "success");
            setStores(stores.filter(store => store.id !== storeId)); 
  
            const productsToDelete = storeProducts[storeId] || [];
            const productIdsToDelete = productsToDelete.map((product) => product.id);
  
            const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  
            const updatedCart = cartItems.filter(
              (item) => !productIdsToDelete.includes(item.productid)
            );
            console.log(updatedCart)
  
            localStorage.setItem("cart", JSON.stringify(updatedCart));
          })
          .catch(error => {
            console.error("Error deleting store:", error);
            Swal.fire("Error!", "Failed to delete store.", "error");
          });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] p-8 ">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">{t("titles")}</h1>

      <div className="flex justify-center space-x-4">
        <Link to="/add" className="px-6 py-3 bg-[#B03052] text-white font-semibold rounded-lg shadow-md hover:bg-[#B03052] transition">
         {t("addProduct")}
        </Link>
        <Link to="/createstore" className="px-6 py-3 bg-[#B03052] text-white font-semibold rounded-lg shadow-md hover:bg-[#B03052] transition">
{t("createStore")}        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length > 0 ? (
          stores.map((store) => (
            <div key={store.id} className="relative p-6 bg-[#FFF2F2] shadow-md rounded-lg hover:shadow-lg transition cursor-pointer">
              <Link to={`/store/${store.id}`}>
                <h2 className="text-xl font-semibold text-gray-800">
                {JSON.parse(store.name)[language] || JSON.parse(store.name)["en"]}
                  </h2>

                <p className="text-gray-600">Store ID: {store.id}</p>
                <p className="text-gray-600">Total Product: {productCounts[store.id] ?? "Loading..."}</p>
              </Link>

              {/* 🔗 Share Icon Button */}
              <button
                onClick={() => CopyUrl(store.id)}
                className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 26 24"
                  fill="none"
                  stroke="currentColor"
                  className="lucide lucide-share-2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                </svg>
              </button>

            <div className="p-4 rounded-lg mt-4">
       
<DownloadCSVButton storeId={store.id} BASE_URL={BASE_URL} />

              {/* 🗑 Delete Store Button */}
              <button
                onClick={() => handleDeleteStore(store.id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-300 w-full"
              >
                        {t("deleteStore")}
              </button>
            </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">{t("noStores")}</p>
        )}
      </div>

      {copySuccess && (
        <div className="fixed bottom-[10%] right-16 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg transition-opacity">
             {t("storeCopied")}
        </div>
      )}
    </div>
  );
}

export default Store;
