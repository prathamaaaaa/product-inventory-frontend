import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {  useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

function CreateStore() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { t } = useTranslation();

  const [storeName, setStoreName] = useState("");
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      const parsedAdmin = JSON.parse(storedAdmin);
      setAdmin(parsedAdmin);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!storeName.trim()) {
      Swal.fire("Error", "Store name cannot be empty!", "error");
      return;
    }

    if (!admin) {
      Swal.fire("Error", "Admin ID not found. Please log in again.", "error");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/stores/add`, {
        name: storeName,
        adminid: admin.id,
      });

      Swal.fire("Success!", "Store created successfully!", "success");
      navigate("/admin/store"); 
    } catch (error) {
      Swal.fire("Error", error.response?.data || "Failed to create store", "error");
    }
  };

  return (

   <>
   
    <div>
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
 <div className="flex self-start mb-14 ml-[20%] ">
 <button onClick={() => navigate("/admin/store")} className="text-primary hover:underline">
 {t("backToList")} 
  </button>
 </div>
      <div className="bg-white p-6 rounded-lg shadow-md w-full sm:w-[60%]  lg:w-[35%] ">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{t("createStore")} </h2>
        {admin ? (
<div>
{/* <p className="text-gray-600 text-center mb-4">Admin ID: {admin.id}</p>
<p className="text-gray-600 text-center mb-4">Admin ID: {admin.name}</p> */}

</div>          
        ) : (
          <p className="text-red-500 text-center mb-4">Admin ID not found</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-4 font-medium">{t("storeName")} </label>
            <input
              type="text"
              placeholder={t("storeName")}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full p-2 mb-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
{t("create")}          </button>
        </form>
      </div>
    </div>
    </div>
   </>
  );
}

export default CreateStore;
