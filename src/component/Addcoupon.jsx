import React, { useState } from 'react';
import axios from 'axios';
import { FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { initializeFirebaseMessaging,  handleForegroundNotification ,getFirebaseToken, onMessageListener, requestFirebaseToken } from '../firebase-messaging'; // Adjust the import path as necessary
  
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
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const res = await axios.post(`${BASE_URL}/api/coupons/add`, coupon);
  //     alert('Coupon added successfully!');
  //     console.log('Saved:', res.data);

  //     setCoupon({
  //       code: '',
  //       discount: '',
  //       minAmount: '',
  //       isActive: true,
  //     });
  //   } catch (err) {
  //     console.error('Error adding coupon:', err);
  //     alert('Failed to add coupon');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        // Save coupon logic
        const res = await axios.post(`${BASE_URL}/api/coupons/add`, coupon);
        alert('Coupon added successfully!');

        const token = await requestFirebaseToken();
        console.log('FCM Token Received:', token);
        onMessageListener();
      
        
        if (token) {
            await axios.post(`${BASE_URL}/api/notification/send`, {
                token,
                title: 'New Coupon Added',
                body: `Coupon ${coupon.code} is live!`,
            });
        }

        setCoupon({ code: '', discount: '', minAmount: '', isActive: true });
    } catch (err) {
        console.error('Error:', err);
        alert('Failed to add coupon or send notification');
    }
};

  return (
  <div className=' w-full  h-screen bg-[#FFF8F3]'>
   <div className='pt-16'>
   <div className="w-[80%] lg:w-[60%] mx-auto bg-[#FDFAF6] shadow-2xl p-6   justify-center pt-10 rounded-lg">
                  <button
            onClick={() => navigate("/admin/coupons")}
            className="text-primary ml-[5%] hover:underline"
          >
            {t("backToList")}
          </button>
      <h2 className="text-2xl font-bold mb-6 text-center">{t("addNewCoupon")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block  font-medium mb-1">{t("couponCode")}</label>
          <input
            type="text"
            name="code"
            value={coupon.code}
            onChange={handleChange}
            required
            placeholder='Enter Coupon Code'
            className="w-full bg-[#f8f4ee] border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">{t("discount")}</label>
          <input
            type="number"
            name="discount"
            placeholder='Enter Discount without %'
            value={coupon.discount}
            onChange={handleChange}
            required
            className="w-full bg-[#f8f4ee] border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">{t("minAmount")}</label>
          <input
            type="number"
            name="minAmount"
            placeholder='Enter Minimum Amout in Rs.'
            value={coupon.minAmount}
            onChange={handleChange}
            required
            className="w-full border bg-[#f8f4ee] p-2 rounded"
          />
        </div>

  

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={coupon.isActive}
            onChange={handleChange}
          />
          <label className="bg-[#f8f4ee] font-medium">{t("active")}</label>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-[#56021F] hover:bg-[#7D1C4A] text-white py-2 px-4 rounded"
        >
          <FaSave />
          {t("saveCoupon")}
          
          </button>
      </form>
    </div>
   </div>
  </div>
  );
}

export default AddCoupon;
