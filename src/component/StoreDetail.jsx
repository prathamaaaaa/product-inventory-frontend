import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function StoreDetail() {
  const { id } = useParams(); // Get Store ID from URL
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]); 

  useEffect(() => {
    // Fetch Store Details
    axios.get(`http://localhost:8081/api/stores/${id}`)
      .then(response => {
        setStore(response.data);

      })
      .catch(error => {
        console.error("Error fetching store details:", error);
      });

    // Fetch Products for Store ID
    axios.get(`http://localhost:8081/api/stores/product/${id}`)
      .then(response => {
        setProducts(response.data); 
        console.log(response.data)
      })
      .catch(error => {
        console.error("Error fetching store products:", error);
      });

  }, [id]);

  if (!store) return <p className="text-center text-lg">Loading store details...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800">{store.name}</h1>
        <p className="text-gray-600 mt-2">Store ID: {store.id}</p>
        <p className="text-gray-600 mt-2">Admin ID: {store.adminid}</p>
      </div>

      {/* ✅ Add Product Button (Pass Store ID) */}
      <div className="mt-6 text-center">
        <Link 
          to={`/add?storeId=${store.id}`}  
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          ➕ Add Product
        </Link>
      </div>

      {/* ✅ Show Store Products */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Products in {store.name}</h2>

        {products.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">💰 Price: ${product.price}</p>
                <p className="text-gray-600">📂 Category: {product.categoryName}</p>
                <p className="text-gray-600">📁 SubCategory: {product.subCategoryName}</p>
                <p className="text-gray-500 text-sm">Product ID: {product.id}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center mt-4">No products found in this store.</p>
        )}
      </div>
    </div>
  );
}

export default StoreDetail;
