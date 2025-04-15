import React from 'react'
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import ChangeLanguage from './BUttons/ChangeLanguage';
import ViewCart from './BUttons/ViewCart';
import Swal from 'sweetalert2';

function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const admin = JSON.parse(localStorage.getItem("admin") || "null");

  const handleLogout = () => {
    Swal.fire({
      title: t("title"),
      text: t("text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        Swal.fire(t("logout_title"), t("logout_message"), "success");
        navigate("/list");
      }
    });
  };
  const handleCheck = () => {
    if (!user) {
      Swal.fire({
        title: t("login_required") || "Login Required",
        text: t("login_prompt") || "You need to log in before proceeding to checkout.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("login") || "Login",
        cancelButtonText: t("cancel") || "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth", { state: { role: "user" } });
        }
      });
    } else {
      navigate("/orders"); // this is where you were trying to go anyway
    }
  };
  
  return (
    <>
      <div>
        <div>
          <div>
            <div className="bg-[#B03052] p-6   shadow-md flex flex-col sm:flex-row justify-between items-center">
              <h1 className="text-3xl font-extrabold p-2 text-[#F8F2DE]"> {t("productList")}</h1>


              {(location.pathname.startsWith("/")) && (
                <div className="sm:flex">

                  <div className="relative mb-2  text-[#F8F2DE] rounded lg:mb-0 inline-block">
                    <ChangeLanguage></ChangeLanguage>
                  </div>

                  <div className='flex justify-self-center'>
                    <div className="">
                      <ViewCart />
                    </div>

                    <div className='mt-2 mr-4 justify-self-center'>
                      <span title='Your Orders'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                          onClick={() => {  handleCheck() }}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={2} className="lucide text-[#F8F2DE] lucide-shopping-bag-icon lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>

                      </span>
                    </div>

                    <div className='mt-2 mr-4 justify-self-center'>
                      <span title='Go to home page'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24"
                          onClick={() => { navigate("/list") }}
                          height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="lucide text-[#EBE8DB]  lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>


                      </span>
                    </div>
                  </div>

                  <div className='justify-self-center'>
                    {user ? (
                      <button
                        onClick={handleLogout}
                        className="bg-[#E52020] ml-4 text-[#F8F2DE] px-6 py-2 rounded hover:bg-red-700"
                      >
                        Logout
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/auth", { state: { role: "user" } })}
                        className="bg-[#EBE8DB] ml-4 text-[#3D0301] px-6 py-2 rounded hover:bg-[#aba797]"
                      >
                        Login
                      </button>
                    )}
                  </div>

                </div>
              )}
              {/* <span className="text-gray-700 font-medium">Admin ID: {admin?.id || "Loading..."}</span> */}

              {(location.pathname.startsWith("/admin/") || location.pathname.startsWith("/store/")) && (
                <Link
                  to={`/add`}
                  className="mt-4 md:mt-0 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
                >
                  {t("addProduct")}
                </Link>
              )}
            </div>
          </div>
        </div>
        <Outlet />
      </div>

    </>
  )
}

export default Header