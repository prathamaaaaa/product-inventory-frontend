import React from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().min(3, "Too short!").required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

function Register() {
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const res = await axios.post("http://localhost:8081/admin/register", values, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      alert("Registered Successfully! " + res.data);
      window.location.reload();
    } catch (error) {
      console.error("Registration Failed", error.response?.data || error.message);
      alert("Error: " + (error.response?.data || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r ">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg flex w-[70%] overflow-hidden"
      >
        <div className="w-1/2 bg-gradient-to-r from-[#6A11CB] to-[#2575FC] flex flex-col justify-center items-center p-8">
          <motion.img 
            src="https://i.imgur.com/zXfI9Xr.png" 
            alt="Logo" 
            className="w-20 mb-4"
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
          />
          <h2 className="text-3xl font-bold text-white">Romanchat</h2>
          <p className="text-white text-sm mt-2 text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <button className="mt-6 bg-white text-[#6A11CB] px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition">
            GET STARTED
          </button>
        </div>

        <div className="w-1/2 p-10 relative">
          <h2 className="text-2xl font-bold text-gray-700">Register</h2>
          <p className="text-gray-500">Create your account in a few seconds.</p>

          <Formik
            initialValues={{ name: "", email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            
          >
            {({ isSubmitting }) => (
              <Form className="mt-6">
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm">Full Name</label>
                  <Field type="text" name="name" className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-600 text-sm">Email</label>
                  <Field type="email" name="email" className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-600 text-sm">Password</label>
                  <Field type="password" name="password" className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white p-3 rounded-lg transition"
                >
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </motion.button>
              </Form>
            )}
          </Formik>

          <div className="text-center mt-4 text-gray-600 text-sm">
            <input type="checkbox" className="mr-2" />
            I accept the <span className="text-blue-500 underline cursor-pointer">Terms of Use & Privacy Policy</span>
          </div>

          <div className="text-center mt-4 text-gray-600 text-sm">
            Already have an account? <a href="/login" className="text-blue-500 hover:underline">Sign In</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
