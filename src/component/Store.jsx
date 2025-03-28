import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Store() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [admin, setAdmin] = useState(null);
  const [stores, setStores] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      const parsedAdmin = JSON.parse(storedAdmin);
      setAdmin(parsedAdmin.id);
    }
  }, []);

  useEffect(() => {
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

  // ✅ Copy Store URL to Clipboard
  function CopyUrl(storeId) {
    const storeUrl = `${window.location.origin}/store/${storeId}`;
    navigator.clipboard.writeText(storeUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => console.error("Error copying:", err));
  }

  // ✅ Download CSV for a Store
  const handleDownloadCSV = (storeId) => {
    axios.get(`${BASE_URL}/api/stores/download-csv/${storeId}`, { responseType: "blob" })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `store_${storeId}_products.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        Swal.fire("Success!", "CSV file downloaded.", "success");
      })
      .catch(error => {
        console.error("Error downloading CSV:", error);
        Swal.fire("Error!", "Failed to download CSV.", "error");
      });
  };

  // ✅ Delete Store Function
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
          })
          .catch(error => {
            console.error("Error deleting store:", error);
            Swal.fire("Error!", "Failed to delete store.", "error");
          });
      }
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">🏪 Your Stores</h1>

      <div className="flex justify-center space-x-4">
        <Link to="/add" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
          ➕ Add Product
        </Link>
        <Link to="/createstore" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
          ➕ Create Store
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length > 0 ? (
          stores.map((store) => (
            <div key={store.id} className="relative p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition cursor-pointer">
              <Link to={`/store/${store.id}`}>
                <h2 className="text-xl font-semibold text-gray-800">{store.name}</h2>
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

              {/* ⬇️ Download CSV Button */}
              <button
                onClick={() => handleDownloadCSV(store.id)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                ⬇️ Download CSV
              </button>

              {/* 🗑 Delete Store Button */}
              <button
                onClick={() => handleDeleteStore(store.id)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full"
              >
                🗑 Delete Store
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">No stores found. Create a new one!</p>
        )}
      </div>

      {copySuccess && (
        <div className="fixed bottom-[10%] right-16 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg transition-opacity">
          Store URL Copied!
        </div>
      )}
    </div>
  );
}

export default Store;
