import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function CreateStore() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState({ en: "", guj: "", hi: "" });
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const handleChange = (lang, value) => {
    setStoreName((prev) => ({ ...prev, [lang]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(storeName).some((value) => value.trim() === "")) {
      Swal.fire("Error", "All store name fields must be filled!", "error");
      return;
    }

    if (!admin) {
      Swal.fire("Error", "Admin ID not found. Please log in again.", "error");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/stores/add`, {
        name: JSON.stringify(storeName),
          adminid: admin.id,
      });
      console.log(response)
      Swal.fire("Success!", "Store created successfully!", "success");
      navigate("/admin/store/");
    } catch (error) {
      Swal.fire("Error", error.response?.data || "Failed to create store", "error");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="flex self-start mb-14 ml-[20%]">
        <button onClick={() => navigate("/admin/store")} className="text-primary hover:underline">
          {t("backToList")}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md w-full sm:w-[60%] lg:w-[35%]">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {t("createStore")}
        </h2>

        {admin ? (
          <div>
            {/* <p className="text-gray-600 text-center mb-4">Admin ID: {admin.id}</p> */}
          </div>
        ) : (
          <p className="text-red-500 text-center mb-4">Admin ID not found</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">{t("storeName")} (English)</label>
            <input
              type="text"
              placeholder="Enter store name in English"
              value={storeName.en}
              onChange={(e) => handleChange("en", e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">{t("storeName")} (Gujarati)</label>
            <input
              type="text"
              placeholder="Enter store name in Gujarati"
              value={storeName.guj}
              onChange={(e) => handleChange("guj", e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">{t("storeName")} (Hindi)</label>
            <input
              type="text"
              placeholder="Enter store name in Hindi"
              value={storeName.hi}
              onChange={(e) => handleChange("hi", e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            {t("create")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateStore;
