import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
function ViewCart() {

    const navigate = useNavigate();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return (
    <div>

        <div>
        <div className="relative ml-4 mr-4 text-[#F8F2DE] md:mb-0 mb-4 mt-2">
              <span title="View Cart">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  onClick={() => navigate("/cart")}
                  className="lucide justify-self-center mb-2 lg:justify-self-end lucide-baggage-claim-icon lucide-baggage-claim"
                >
                  <path d="M22 18H6a2 2 0 0 1-2-2V7a2 2 0 0 0-2-2" />
                  <path d="M17 14V4a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v10" />
                  <rect width="13" height="8" x="8" y="6" rx="1" />
                  <circle cx="18" cy="20" r="2" /><circle cx="9" cy="20" r="2" />
                </svg>
              </span>

              {/* Notification bubble */}
              {cart && cart.length > 0 && (

                <span className="absolute lg:-top-1 lg:-right-3 -top-2 left-4   bg-[#56021F] text-[#EBE8DB] text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}

                </span>

              )}
            </div>
        </div>
    </div>
  )
}

export default ViewCart