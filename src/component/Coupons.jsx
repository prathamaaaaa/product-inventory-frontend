import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTranslation } from "react-i18next";

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
    const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");



  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/coupons/all`);
      const activeCoupons = res.data;
      setCoupons(activeCoupons);
      console.log("Coupons fetched:", activeCoupons);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    }
  };
  const toggleStatus = async (id, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/coupons/${id}/status`, {
        active: newStatus,
      });
      fetchCoupons();
    } catch (err) {
      console.error("Failed to update coupon status", err);
      alert("Could not update status");
    }
  };

  const deleteapi = async (id) => {
    await axios.delete(`${BASE_URL}/api/coupons/${id}`);
    fetchCoupons();
    };
  const deleteCoupon = async (id) => {
    try {
    
      Swal.fire({
        title: "Delete Coupon",
        text:"are you sure you want to delete this coupon?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Deleted!", "The coupon has been deleted.", "success");
        deleteapi(id);
        }

      });
   
    } catch (err) {
      console.error("Failed to delete coupon", err);
      alert("Could not delete coupon");
    }
  }
  
  useEffect(() => {
    fetchCoupons(); 
  }, []);

  return (
    <div className="p-6  ">
<div className='flex justify-between  items-center mb-4'>
<h2 className="text-2xl font-bold mb-4"> {t("Available Coupons")}</h2>
<button onClick={()=>{navigate("/addcoupon")}} className='bg-[#B03052] p-4 rounded-lg text-white font-bold hover:bg-[#B03052]'>{t("Add Coupons")}</button>
    </div> 
         {coupons.length === 0 ? (
        <p>{t('noActiveCoupons')}
</p>
      ) : (
        <ul className="space-y-4">
          {coupons.map((coupon) => (
            <li key={coupon.id} className="bg-[#FFF2F2] text-black shadow p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{coupon.name}</h3>
            <p className="">{t("Code")} : <span className="font-mono">{coupon.code}</span></p>
            <p className="">{t("Discount")} : ₹{coupon.discount}</p>
            <p className="">{t("Used")} : {coupon.usercount}/10</p>
          
            {coupon.usercount >= 10 ? (
              <p className="text-red-500 font-semibold">{t('couponExpired')}  </p>
            ) : (
              <p className="text-green-600 font-semibold">{t("Available")} </p>
            )}
          
            <div className="mt-2">
              <button
                onClick={() => toggleStatus(coupon.id, !coupon.active)}
                className={`px-3 py-1 rounded ${
                  coupon.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {coupon.active ? t("Deactivate") : t('activate')}
              </button>
              <button onClick={() => deleteCoupon(coupon.id)} className='px-3 py-1 ml-2 bg-red-500 rounded text-white'>{t("Delete")} </button>
            </div>
          </li>
          
          ))}
        </ul>
      )}
    </div>
  );
}

export default Coupons;
