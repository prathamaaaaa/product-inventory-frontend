import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import List from "./List";
import Swal from "sweetalert2";
import Papa from "papaparse"; // ✅ Import CSV Parser

function StoreDetail() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { id } = useParams(); // Get Store ID from URL
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]); 
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState(id); // ✅ Auto-select current store
  const [admin, setAdmin] = useState(null); // ✅ Store Admin ID

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin).id);
    }

    axios.get(`${BASE_URL}/api/stores/${id}`)
      .then(response => {
        setStore(response.data);
      })
      .catch(error => {
        console.error("Error fetching store details:", error);
      });

    // ✅ Fetch Products for Store ID
    axios.get(`${BASE_URL}/api/stores/product/${id}`)
      .then(response => {
        setProducts(response.data.products || []);
      })
      .catch(error => {
        console.error("Error fetching store products:", error);
      });
  }, [id]);
  const handleUploadCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      Swal.fire("Error", "Please select a CSV file", "error");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target.result;
  
      // ✅ Convert CSV to JSON using PapaParse
      const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  
      if (!admin || !selectedStore) {
        Swal.fire("Error", "Admin ID or Store ID is missing.", "error");
        return;
      }
  
      const formattedData = parsedData.data.map(obj => ({
        name: obj["Product Name"]?.trim() || "Unknown Product", // ✅ Default value
        details: obj["Details"]?.trim() || "No details provided",
        price: obj["Price"] ? parseFloat(obj["Price"]) : 0, // ✅ Ensure price is a number
        imageUrls: obj["Image URLs"] ? obj["Image URLs"].split(" | ") : [],
        adminId: admin,
        storeId: selectedStore,
        categoryId: obj["Category ID"] ? parseInt(obj["Category ID"]) : null, // ✅ Fix category ID
        subcategoryId: obj["Subcategory ID"] ? parseInt(obj["Subcategory ID"]) : null, // ✅ Fix subcategory ID
      }));
  
      // ✅ Check for missing fields before sending
      const missingFields = formattedData.some(
        p => !p.name || !p.details || !p.categoryId || !p.subcategoryId || !p.adminId || !p.storeId
      );
  
      if (missingFields) {
        Swal.fire("Error", "Some products have missing required fields. Check your CSV.", "error");
        return;
      }
  
      try {
        await axios.post(`${BASE_URL}/api/products/upload-csv`, formattedData, {
          headers: { "Content-Type": "application/json" },
        });
  
        Swal.fire("Success!", "Products uploaded successfully.", "success");
      } catch (error) {
        console.error("Error uploading CSV:", error.response?.data || error.message);
        Swal.fire("Error!", "Failed to upload CSV.", "error");
      }
    };
  
    reader.readAsText(file);
  };
  
  

  if (!store) return <p className="text-center text-lg">Loading store details...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button onClick={() => navigate("/admin/store")} className="text-primary hover:underline">
        ← Back to List
      </button>

     

      <div className="bg-white flex p-6 rounded-lg shadow-lg text-center mt-4">
        <div>
        <h1 className="text-3xl font-bold text-gray-800">{store.name}</h1>
        <p className="text-gray-600 mt-2">Store ID: {store.id}</p>
        <p className="text-gray-600 mt-2">Admin ID: {store.adminid}</p>
        </div>
 <div>
 <label className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition cursor-pointer">
        📤 Upload CSV
        <input type="file" accept=".csv" className="hidden" onChange={handleUploadCSV} />
      </label>
 </div>
      </div>
      <List storeId={id} />
    </div>
  );
}

export default StoreDetail;
