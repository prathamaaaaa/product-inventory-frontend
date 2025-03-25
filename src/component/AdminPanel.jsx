import React, { useState, useEffect } from "react";
import { FaTasks, FaUsers, FaProjectDiagram, FaBars, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate ,Link } from "react-router-dom";
import axios from "axios";
import List from "./List";
import Swal from "sweetalert2";

import Papa from "papaparse"; // ✅ Import CSV Parser



function AdminPanel() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();


  const handleUploadPopup = () => {
    Swal.fire({
      title: "Upload Product CSV",
      input: "file",
      inputAttributes: {
        accept: ".csv",
      },
      showCancelButton: true,
      confirmButtonText: "Upload",
      preConfirm: (file) => {
        return new Promise((resolve, reject) => {
          if (!file) {
            Swal.showValidationMessage("Please select a CSV file");
            return reject();
          }

          // ✅ Parse CSV
          const reader = new FileReader();
          reader.onload = (e) => {
            const csvData = e.target.result;
            const parsedData = Papa.parse(csvData, {
              header: true, // ✅ Use first row as keys
              skipEmptyLines: true,
            });

            resolve(parsedData.data); // ✅ Send parsed data
          };
          reader.readAsText(file);
        });
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        handleCSVUpload(result.value);
      }
    });
  };
  // ✅ Convert CSV data to correct format
  

  const handleDeleteAdmin = async () => {
    if (!admin || !admin.id) {
      Swal.fire("Error", "Admin ID not found.", "error");
      return;
    }
  
    Swal.fire({
      title: "Do you want to save your data before deleting?",
      text: "A CSV file will be downloaded before deletion.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Download & Delete",
      cancelButtonText: "No, Just Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // ✅ Request CSV from backend
          const response = await axios.get(`http://localhost:8081/admin/download-csv/${admin.id}`, {
            responseType: "blob", // Important for file downloads
          });
  
          if (response.status === 400) {
            Swal.fire("Error", "No products found for this admin.", "error");
            return;
          }
  
          // ✅ Create a Blob and trigger download
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `admin_products_${admin.id}.csv`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
  
          Swal.fire("Success!", "Your product data has been downloaded as a CSV file.", "success");
  
          // ✅ After successful CSV download, delete the admin and products
          await deleteAdminAndProducts();
  
        } catch (error) {
          const errorMessage = error.response?.data || "Failed to download CSV file.";
          Swal.fire("Error", String(errorMessage), "error");
        }
      } else {
        // ✅ Directly delete admin if user chooses not to download
        await deleteAdminAndProducts();
      }
    });
  };
  
  // ✅ Function to Delete Admin & Products
  const deleteAdminAndProducts = async () => {
    try {
      await axios.delete(`http://localhost:8081/admin/confirm-delete/${admin.id}`);
      Swal.fire("Deleted!", "Your account and all products have been deleted.", "success");
      localStorage.removeItem("admin");
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      const errorMessage = error.response?.data || "Failed to delete account.";
      Swal.fire("Error", String(errorMessage), "error");
    }
  };




  const handleCSVUpload = async (csvData) => {
    if (!admin || !admin.id) {
      Swal.fire("Error", "Admin ID not found. Please log in again.", "error");
      return;
    }
  
    const payload = csvData.map((row, index) => {
      const categoryId = row["Category ID"] ? parseInt(row["Category ID"]) : null;
      const subcategoryId = row["Subcategory ID"] ? parseInt(row["Subcategory ID"]) : null;
  
      if (!categoryId || !subcategoryId) {
        console.error(`❌ Missing Category/Subcategory for row ${index + 1}:`, row);
      }
  
      return {
        name: row["Product Name"] || "",
        details: row["Details"] || "",
        price: parseFloat(row["Price"] || 0),
        imageUrls: row["Image URLs"] ? row["Image URLs"].split(" | ") : [],
        adminId: admin.id,
        categoryId,
        subcategoryId,
      };
    });
  
    // Check for missing category/subcategory before sending
    const missingFields = payload.some(p => !p.categoryId || !p.subcategoryId);
    if (missingFields) {
      Swal.fire("Error", "Some products are missing category or subcategory ID. Check console logs.", "error");
      return;
    }
  
    try {
      await axios.post("http://localhost:8081/api/products/upload-csv", payload, {
        headers: { "Content-Type": "application/json" },
      });
  
      Swal.fire("Success!", "Products uploaded successfully.", "success");
    } catch (error) {
      Swal.fire("Error", error.response?.data || "Failed to upload products.", "error");
    }
  };
  
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    } else {
      navigate("/");
    }
  }, [navigate]);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/products/all");
        setProducts(res.data.products || []);
        setCategories(res.data.categories || []);
        setSubCategories(res.data.subCategories || []);
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);



  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform logout actions
        localStorage.removeItem("admin");
        window.location.href = "/login"; // Redirect to login page
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Responsive & Scrollable */}
      <motion.div
        animate={{ width: isSidebarOpen ? "16rem" : "0" }}
        className={`bg-[#1E3A8A] text-white flex flex-col fixed h-screen overflow-y-auto z-50 transition-all duration-300 ${
          isSidebarOpen ? "left-0" : "-left-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dash UI</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-white focus:outline-none"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <ul className="flex-grow space-y-2">
          <li className="p-4 hover:bg-[#334155] cursor-pointer flex items-center space-x-3">
            <FaProjectDiagram /> <span>Dashboard</span>
          </li>
          <li className="p-4 hover:bg-[#334155] cursor-pointer flex items-center space-x-3">
            <FaTasks /> <span>Projects</span>
          </li>
          <li className="p-4 hover:bg-[#334155] cursor-pointer flex items-center space-x-3">
            <FaUsers /> <span>Tasks</span>
          </li>
        </ul>
        <div className="p-4 border-t border-gray-600">
          <button onClick={() => handleUploadPopup()} className="text-green-500 hover:underline">
            Upload CSV
          </button>
        </div>
        <div className="p-4 border-t border-gray-600">
  <button onClick={handleDeleteAdmin} className="text-red-600 hover:underline">
    Delete your Acount
  </button>
</div>
        <div className="p-4 border-t border-gray-600">
  <button onClick={handleLogout} className="text-red-600 hover:underline">
    Logout
  </button>
</div>

      </motion.div>

      {/* Main Content */}
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isSidebarOpen ? "lg:ml-[16rem]" : ""}`}>
        {/* Header with Sidebar Toggle Button */}
        <div className="bg-white p-5 shadow flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-700 focus:outline-none"
          >
            <FaBars size={24} />
          </button>

          <h2 className="text-xl font-bold">Admin Dashboard</h2>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">{admin?.name || "Loading..."}</span>
            <span className="text-gray-700 font-medium">{admin?.id || "Loading..."}</span>

           
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="flex justify-center">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            <motion.div
              className="bg-white p-6 justify-center shadow rounded-xl lg:w-[300px] lg:h-[250px] flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <FaProjectDiagram className="text-6xl text-blue-500" />
              <h3 className="text-2xl font-semibold mt-2">Products</h3>
              <p className="text-gray-600 text-5xl font-semibold mt-4">{products.length}</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 justify-center shadow rounded-xl flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <FaTasks className="text-6xl text-green-500" />
              <h3 className="text-2xl font-semibold mt-2">Categories</h3>
              <p className="text-gray-600 text-5xl font-semibold mt-4">{categories.length}</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 shadow rounded-xl justify-center flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <FaUsers className="text-6xl text-yellow-500" />
              <h3 className="text-2xl font-semibold mt-2">Sub Categories</h3>
              <p className="text-gray-600 text-5xl font-semibold mt-4">{subCategories.length}</p>
            </motion.div>
          </div>
        </div>

        {/* Product List Section */}
        <List />
      </div>
    </div>
  );
}

export default AdminPanel;