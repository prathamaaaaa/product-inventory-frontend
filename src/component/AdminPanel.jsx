import React, { useState, useEffect } from "react";
import { FaTasks, FaUsers, FaProjectDiagram, FaBars, FaTimes, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Outlet } from "react-router-dom";

import Papa from "papaparse";

import { useTranslation } from "react-i18next";
// import { Globe, ChevronDown } from "lucide-react";
import i18n from "./i18n";
import ChangeLanguage from "./BUttons/ChangeLanguage";

function AdminPanel() {

  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation();



  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();


  

  const deleteAdminAndProducts = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete your admin account and related data permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/admin/confirm-delete/${admin.id}`);
        
        Swal.fire("Deleted!", "Your admin account has been deleted.", "success");
        localStorage.removeItem("admin");
        window.location.href = "/auth";
      } catch (error) {
        const errorMessage = error.response?.data || t("failedToDelete");
        Swal.fire("Error", String(errorMessage), "error");
      }
    } else {
      Swal.fire("Cancelled", "Your account is safe.", "info");
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

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products/all`);
      setProducts(res.data.products || []);
      setCategories(res.data.categories || []);
      setSubCategories(res.data.subCategories || []);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);



  const handleLogout = () => {

    Swal.fire({
      title: t("areYouSure"),
      text: t("willBeLoggedOut"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("yesLogout"),
    }).then((result) => {
      if (result.isConfirmed) {

        localStorage.removeItem("admin");
        delete axios.defaults.headers.common["Authorization"];

        window.location.href = "/auth";
      }
    });
  };

  return (
    <div className="flex  bg-[#FFF8F3]">
      <div>

      </div>
      {/* Sidebar - Responsive & Scrollable */}
      <motion.div
        animate={{ width: isSidebarOpen ? "16rem" : "0" }}
        className={`bg-[#B03052] text-white flex flex-col fixed h-screen overflow-y-auto z-50 transition-all duration-300 ${isSidebarOpen ? "left-0" : "-left-64"
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t("dashUI")}</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-white focus:outline-none"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <ul className="flex-grow space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `p-4 flex items-center space-x-3 cursor-pointer 
       ${isActive ? "bg-[#EBE8DB] text-black" : "text-white hover:text-black hover:bg-[#EBE8DB] "}`
            }
          >
            <FaProjectDiagram /> <span>{t("dashboard")}</span>
          </NavLink>

          <NavLink
  to="/admin/store"
  className={({ isActive }) =>
    `p-4 flex items-center space-x-3 cursor-pointer 
       ${isActive ? "bg-[#EBE8DB] text-black" : "text-white hover:text-black hover:bg-[#EBE8DB] "}`
  }
>

  <FaUsers /> <span>{t("stores")}</span>
</NavLink>

<NavLink
  to="/admin/coupons"
  className={({ isActive }) =>
    `p-4 flex items-center space-x-3 cursor-pointer 
       ${isActive ? "bg-[#EBE8DB] text-black" : "text-white hover:text-black hover:bg-[#EBE8DB] "}`
  }
>
  <FaPlus /> <span>Add Coupons</span>
</NavLink>

          <div className="relative inline-block text-white rounded-md hover:bg-[#B03052] hover:text-white">
            {/* Icon button to toggle dropdown */}
            {/* <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center px-3 py-2  text-white rounded-md hover:bg-[#334155] hover:text-white transition"
            >
              <Globe className="w-5 mr-5 h-5" />
              {t("selectLanguage")}
              <ChevronDown className="w-4 ml-2 h-4" />
            </button>

            {isOpen && (
        */}
            <ChangeLanguage /> 
            {/* )} */}
          </div>
        </ul>


        <div className="p-4 border-t border-gray-600">
          <button onClick={deleteAdminAndProducts} className="text-white hover:underline">
            {t("deleteAccount")}
          </button>
        </div>
        <div className="p-4 border-t border-gray-600">
          <button onClick={handleLogout} className="text-white hover:underline">
            {t("logout")}
          </button>
        </div>

      </motion.div>

      {/* Main Content */}
      <div className={`flex flex-col flex-grow transition-all duration-300 ${isSidebarOpen ? "lg:ml-[16rem]" : ""}`}>
        {/* Header with Sidebar Toggle Button */}
        <div className="bg-[#FDFAF6] p-5 shadow flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-700 focus:outline-none"
          >
            <FaBars size={24} />
          </button>

          <h2 className="text-xl font-bold">{t("adminDashboard")}</h2>
        
          <div  className="flex  items-center space-x-4">
            <span className="text-gray-700 font-medium">{admin?.name || "Loading..."}</span>

          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="flex justify-center">
          <div className="grid md:grid-cols-2 w-[80%] lg:w-[70%] lg:grid-cols-3 gap-4 lg:gap-6 p-6">
            <motion.div
              className="bg-[#FDFAF6] p-6 justify-center shadow rounded-xl flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <FaProjectDiagram className="text-6xl text-blue-500" />
              <h3 className="text-2xl font-semibold mt-2">{t("products")}</h3>
              <p className="text-gray-600 text-5xl font-semibold mt-4">{products.length}</p>
            </motion.div>

            <motion.div
              className="bg-[#FDFAF6] p-6 justify-center shadow rounded-xl flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <FaTasks className="text-6xl text-green-500" />
              <h3 className="text-2xl font-semibold mt-2">{t("categories")}</h3>
              <p className="text-gray-600 text-5xl font-semibold mt-4">{categories.length}</p>
            </motion.div>

            <motion.div
              className="bg-[#FDFAF6] p-6 shadow rounded-xl justify-center flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <FaUsers className="text-6xl text-yellow-500" />
              <h3 className="text-2xl font-semibold mt-2"> {t("subCategories")}</h3>
              <p className="text-gray-600 text-5xl font-semibold mt-4">{subCategories.length}</p>
            </motion.div>
          </div>
        </div>

        {/* Product List Section */}
   
        <Outlet />
      </div>
    </div>
  );
}

export default AdminPanel;