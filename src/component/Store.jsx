import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Store() {
  const [admin, setAdmin] = useState(null);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    // ✅ Fetch Admin ID from Local Storage
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      const parsedAdmin = JSON.parse(storedAdmin);
      setAdmin(parsedAdmin.id);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      // ✅ Fetch Stores from Backend for this Admin
      axios.get(`http://localhost:8081/api/stores/admin/${admin}`)
        .then(response => {
          setStores(response.data);
        })
        .catch(error => {
          console.error("Error fetching stores:", error);
        });
    }
  }, [admin]);

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

      {/* ✅ Display Stores */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length > 0 ? (
          stores.map(store => (
            <Link 
              to={`/store/${store.id}`} 
              key={store.id} 
              className="p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-gray-800">{store.name}</h2>
              <p className="text-gray-600">Store ID: {store.id}</p>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">No stores found. Create a new one!</p>
        )}
      </div>
    </div>
  );
}

export default Store;
