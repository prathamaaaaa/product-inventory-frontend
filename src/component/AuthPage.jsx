import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import * as Yup from "yup";
import { useNavigate , useLocation } from "react-router-dom";
// import animationData from "../lotties/animation.lottie";
// import Lottie from "react-lottie";


// const defaultOptions = {
//   loop: true,
//   autoplay: true,
//   animationData: animationData, // ✅ Corrected reference
//   rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
// };
const validationSchema = Yup.object({
  name: Yup.string().min(3, "Too short!").required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});
function AuthPage() {
  const location = useLocation();
  const role = location.state?.role || "Admin"; 
  console.log("User Role:", role);

    const [isLogin, setIsLogin] = useState(true); 
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const navigate = useNavigate(); 
    const BASE_URL = import.meta.env.VITE_BASE_URL;

  const toggleForm = () => setIsLogin(!isLogin);

  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { ...values, role };  
      console.log("Submitting Data:", payload);
      const url = isLogin
        ? `${BASE_URL}/admin/login`
        : `${BASE_URL}/admin/register`;
      
      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
    });

      if (isLogin) {
        
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        const userRole = res.data;
        console.log("User Roleeee:", userRole);
        console.log("Userssss Role:",res.data.role);
        
        
        if (userRole.role === "Admin") {
          localStorage.setItem("admin", JSON.stringify(res.data));
          navigate("/admin/dashboard");
      } else if (userRole.role === "user") {
        localStorage.setItem("user", JSON.stringify(res.data));
          navigate("/list");
      } else {
          alert("Unknown role! Redirecting to home.");
      }
      } else {
        alert("Registered Successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Error: " + (error.response?.data || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/google`, {
        token: credentialResponse.credential,
      });

      if (res.data.token) {
        alert("Google Login Successful!");
        localStorage.setItem("admin", JSON.stringify(res.data));
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        console.log(res.data.role)


      } else {
        alert("Google Login Failed!");
      }
      
        
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        const userRole = res.data.role;
        console.log("User Roleeee:", userRole);
        console.log("Userssss Role:",res.data.role);
        
        
        if (userRole === "Admin") {
          localStorage.setItem("admin", JSON.stringify(res.data));
          navigate("/admin/dashboard");
      } else if (userRole === "user") {
        localStorage.setItem("user", JSON.stringify(res.data));
          navigate("/list");
      } else {
          alert("Unknown role! Redirecting to home.");
      }
       
    } catch (error) {
      console.error("Google Login Error:", error.response?.data || error.message);
    }
  };
  return (
    <GoogleOAuthProvider clientId="45809495699-dbklp080vhk4il0uuoko2951o48jk2ku.apps.googleusercontent.com">
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg flex lg:w-[70%] w-[90%] overflow-hidden"
        >
          {/* Left Section */}
          <div className="w-1/2 bg-gradient-to-r md:block hidden from-[#6A11CB] to-[#2575FC] lg:flex lg:flex-col lg:justify-center lg:items-center p-8">
    
            <h2 className="text-3xl font-bold text-white">Inventoryy System</h2>
            <p className="text-white text-sm mt-2 text-center">
              Welcome to the future of communication.
            </p>
            <button onClick={toggleForm} className="mt-6 bg-white text-[#6A11CB] px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition">
              {isLogin ? "Go to Register" : "Go to Login"}
            </button>
          </div>

          {/* Right Section */}
          <div className="md:w-1/2 w-full p-10 relative">
            <h2 className="text-2xl font-bold text-gray-700">{isLogin ? "Login" : "Register"}</h2>
            <p className="text-gray-500">{isLogin ? "Welcome back!" : "Create your account in a few seconds."}</p>

            {/* Form */}
            <Formik
              initialValues={{ name: "", email: "", password: "",role  }}
              validationSchema={isLogin ? validationSchema.pick(["email", "password"]) : validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="mt-6">
                  {!isLogin && (
                    <div className="mb-4">
                      <label className="block text-gray-600 text-sm">Full Name</label>
                      <Field type="text" name="name" className="w-full p-3 mt-1 border rounded-lg" />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-600 text-sm">Email</label>
                    <Field type="email" name="email" className="w-full p-3 mt-1 border rounded-lg" />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-600 text-sm">Password</label>
                    <Field type="password" name="password" className="w-full p-3 mt-1 border rounded-lg" />
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white p-3 rounded-lg transition"
                  >
                    {isSubmitting ? (isLogin ? "Logging in..." : "Signing up...") : isLogin ? "Login" : "Sign Up"}
                  </motion.button>
                </Form>
              )}
            </Formik>

            {/* Google Sign-In */}
            <div className="text-center mt-4 text-gray-600 text-sm">or login with</div>
            <div className="flex justify-center gap-4 mt-2">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google Login Failed")} />
            </div>

            {/* Footer Links */}
            <div className="text-center mt-4 text-gray-600 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"} 
              <button onClick={toggleForm} className="text-blue-500 hover:underline ml-1">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default AuthPage;
