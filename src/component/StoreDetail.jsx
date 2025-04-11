import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import List from "./List";
import Swal from "sweetalert2";
import Papa from "papaparse"; // ✅ Import CSV Parser
import { useTranslation } from "react-i18next";

function StoreDetail() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { t } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  const { id } = useParams(); // Get Store ID from URL
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState(id);
  const [admin, setAdmin] = useState(null);
  const fetchProducts = () => {
    axios
      .get(`${BASE_URL}/api/stores/product/${id}`)
      .then((response) => {
        setProducts(response.data.products || []);
      })
      .catch((error) => {
        console.error("Error fetching store products:", error);
      });
  };
  
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

    axios.get(`${BASE_URL}/api/stores/product/${id}`)
      .then(response => {
        setProducts(response.data.products || []);
        fetchProducts(); 

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

      const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      if (!admin || !selectedStore) {
        Swal.fire("Error", "Admin ID or Store ID is missing.", "error");
        return;
      }

      const formattedData = parsedData.data.map(obj => ({
        name: obj["Product Name"]?.trim() || "Unknown Product",
        details: obj["Details"]?.trim() || "No details provided",
        price: obj["Price"] ? parseFloat(obj["Price"]) : 0,
        imageUrls: obj["Image URLs"] ? obj["Image URLs"].split(" | ") : [],
        adminId: admin,
        storeId: selectedStore,
        categoryId: obj["Category ID"] ? parseInt(obj["Category ID"]) : null,
        subcategoryId: obj["Subcategory ID"] ? parseInt(obj["Subcategory ID"]) : null,
      }));

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

        fetchProducts();
        setTimeout(() => window.location.reload(), 1000);
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
{t("backToList")}      </button>



      <div className="bg-white flex justify-between mb-10 p-6 rounded-lg shadow-lg text-center mt-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
          {JSON.parse(store.name)[language] || JSON.parse(store.name)["en"]}
          </h1>

        </div>
        <div>
      <label className="px-6 py-3 font-semibold rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 transition cursor-pointer flex items-center space-x-2">
        
        {/* 📂 Folder Upload Icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="lucide lucide-folder-up"
        >
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
          <path d="M12 10v6" />
          <path d="m9 13 3-3 3 3" />
        </svg>

        {/* Upload Text */}
        <span>{t("uploadCSV")}</span>

        {/* Hidden File Input */}
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={handleUploadCSV} 
        />
      </label>
        </div>
      </div>
      <List storeId={id} />
    </div>
  );
}

export default StoreDetail;
