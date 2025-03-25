import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8081/admin/login", {
        email: credentials.email,
        password: credentials.password,
      });
      
      if (res.data) {
        alert("Logged in! Token: " + res.data.token);
        alert("Logged in! Token: " + res.data.name);
         
        localStorage.setItem("admin", JSON.stringify(res.data));
        localStorage.setItem("token", res.data.token);

        navigate("/admin/adminpanel"); 
      } else {
        alert("Invalid credentials!");
      }
    } catch (error) {
      console.error("Login Failed", error);
    }
  };
  

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8081/auth/google", {
        token: credentialResponse.credential,
      });
  
      if (res.data.token) {
        alert("Google Login Successful!");
        console.log(" Admin Data:", res.data);
  
       
        localStorage.setItem("admin", JSON.stringify(res.data));
        navigate("/admin/adminpanel");
      } else {
        alert(" Google Login Failed!");
      }
    } catch (error) {
      console.error("Google Login Error:", error.response?.data || error.message);
    }
  };
  
  

  return (
    <GoogleOAuthProvider clientId="45809495699-dbklp080vhk4il0uuoko2951o48jk2ku.apps.googleusercontent.com">
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-[#eef3f7] rounded-2xl shadow-lg relative flex justify-between w-[70%]">
          
          {/* Left Section */}
          <div className="w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-800">Log In</h2>
            <p className="text-gray-500 mt-2">Welcome back! Please enter your details.</p>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5">
              <label className="block text-gray-600 text-sm">Email</label>
              <input type="email" name="email" placeholder="you@example.com"
                className="w-full p-2 mt-1 border rounded-lg" onChange={handleChange} />

              <label className="block text-gray-600 text-sm mt-3">Password</label>
              <input type="password" name="password" placeholder="••••••••"
                className="w-full p-2 mt-1 border rounded-lg" onChange={handleChange} />

              <button type="submit"
                className="w-full mt-4 bg-[#1E3E62] text-white p-2 rounded-lg hover:bg-[#384B70]">
                Login
              </button>
            </form>

            {/* Google Sign-In */}
            <div className="text-center mt-4 text-gray-600 text-sm">or login with</div>
            <div className="flex justify-center gap-4 mt-2">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google Login Failed")} />
            </div>

            <div className="text-center mt-4 text-gray-600 text-sm">
              Don't have an account? <a href="/register" className="text-[#1E3E62] hover:underline">Sign Up</a>
            </div>
          </div>

          {/* Right Section - Image */}
          <div className="bg-[#D4EBF8] flex justify-center items-center w-[30%]">
            <div className="absolute right-[25%]">
              <img src="https://i.imgur.com/zXfI9Xr.png" alt="Illustration" />
            </div>
          </div>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
