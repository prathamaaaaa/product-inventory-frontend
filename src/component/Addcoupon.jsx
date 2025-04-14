import React, { useState } from 'react';
import axios from 'axios';
import { FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

function AddCoupon() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [coupon, setCoupon] = useState({
    code: '',
    discount: '',
    minAmount: '',
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCoupon({
      ...coupon,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
console.log(coupon,"coupon")
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/api/coupons/add`, coupon);
      alert('Coupon added successfully!');
      console.log('Saved:', res.data);

      setCoupon({
        code: '',
        discount: '',
        minAmount: '',
        isActive: true,
      });
    } catch (err) {
      console.error('Error adding coupon:', err);
      alert('Failed to add coupon');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg p-6 mt-10 rounded-lg">
                  <button
            onClick={() => navigate("/admin/coupons")}
            className="text-primary ml-[5%] hover:underline"
          >
            {t("backToList")}
          </button>
      <h2 className="text-2xl font-bold mb-6 text-center">{t("addNewCoupon")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block font-medium mb-1">{t("couponCode")}</label>
          <input
            type="text"
            name="code"
            value={coupon.code}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">{t("discount")}</label>
          <input
            type="number"
            name="discount"
            value={coupon.discount}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">{t("minAmount")}</label>
          <input
            type="number"
            name="minAmount"
            value={coupon.minAmount}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

  

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={coupon.isActive}
            onChange={handleChange}
          />
          <label className="font-medium">{t("active")}</label>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          <FaSave />
          {t("saveCoupon")}
          
          </button>
      </form>
    </div>
  );
}

export default AddCoupon;
