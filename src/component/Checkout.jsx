import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Stepper, Step, StepLabel ,StepIcon } from '@mui/material';
// import { yellow } from "@mui/material/colors";

export default function Checkout() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const total = location.state?.total || 0;
  const code = location.state?.couponCode;
  console.log("Code :", code);
  const singleProduct = location.state?.selectedItems || null;
  const [step, setStep] = useState(1);
  const stepLabels = [
    "Shipping Address",
    "Shipping Method",
    "Payment",
    "Order Details"
  ];

  // console.log("Single Product :", singleProduct.productid);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [paymentId, setPaymentId] = useState("");
  const [refundDone, setRefundDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);


  const [message, setMessage] = useState("");
  const handleRefund = async () => {
    try {
      const res = await axios.post("http://localhost:8081/api/checkout/refund", {
        paymentId,
      });
      console.log(res.data);
      setMessage("Refund successful!");
      setRefundDone(true);
      Swal.fire({
        icon: "success",
        title: "Refund Successful!",
        text: "Your payment has been refunded successfully.",
      });
    } catch (err) {
      console.error(err);
      setMessage("Refund failed.");
      Swal.fire({
        icon: "error",
        title: "Refund Failed!",
        text: "Something went wrong during the refund process.",
      });
    }
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const amount = Math.round(Number(total)) // => 4845 (valid for Razorpay)
  console.log("Cart :", cart);

  let currentOrderId = '';

  const handleRazorpayPayment = async () => {
    if (!cart.length && !singleProduct?.length) {
      Swal.fire({
        icon: "warning",
        title: "Cart is Empty",
        text: "Please add items to your cart before proceeding to payment.",
      });
      return;
    }
    try {


      const res = await axios.post("http://localhost:8081/api/checkout/create-order", { amount });
      const { orderId, amount: amt, currency, key } = res.data;
      await axios.post("http://localhost:8081/api/checkout/payment-details", {
        userid: user.id,
        razorpayKey: key,
      });

      const options = {
        key: key,
        amount: amt,
        currency: currency,
        name: "My Shop",
        description: "Order Payment",
        order_id: orderId,

        handler: async function (response) {
          console.log("Payment ID:", response.razorpay_payment_id);
          console.log("Order ID:", response.razorpay_order_id);
          console.log("Signature:", response.razorpay_signature);

          setPaymentId(response.razorpay_payment_id);

          try {
            const itemsToSend = singleProduct
              ? singleProduct.map((item) => ({
                productid: item.productid,
                productname: item.productname,
                quantity: item.quantity,
                price: item.price,
              }))
              : cart.map((item) => ({
                productid: item.productid,
                productname: item.productname,
                quantity: item.quantity,
                price: item.price,
              }));

            const paymentPayload = {
              userid: user.id,
              paymentid: response.razorpay_payment_id,
              orderid: response.razorpay_order_id,
              status: "success",
              amount: amount,
              couponcode: code,
              cartItems: JSON.stringify(itemsToSend),
            };

            console.log("Payment Payload:", paymentPayload);
            await axios.post("http://localhost:8081/api/checkout/payment-details", paymentPayload);

            currentOrderId = response.razorpay_order_id;
            console.log("Current Order ID:", currentOrderId);
            localStorage.setItem("currentOrderId", currentOrderId);


            Swal.fire({
              icon: "success",
              title: "Payment Successful",
              text: "Your payment has been processed and recorded.",
            });
            localStorage.removeItem("cart");
            setStep(4)
          } catch (err) {
            console.error("Error sending payment data:", err);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to record payment on the server.",
            });
          }
        }
        ,


        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: user.email,
          contact: formData.mobile,
        },
        theme: {
          color: "#3399cc",
        },
      };

      console.log(options);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      alert("Payment failed");
    }
  };


  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.address1) newErrors.address1 = "Address is required";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    if (!formData.zip) newErrors.zip = "ZIP code is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const Submit = async () => {
    console.log("Form submitted:", formData);
    // e.preventDefault();
    const payload = {
      userid: user.id,
      firstname: formData.firstName,
      lastname: formData.lastName,
      address1: formData.address1,
      address2: formData.address2,
      mobile: formData.mobile,
      zipcode: formData.zip,
      city: formData.city,
      state: formData.state,
    };

    const checkoutData = { ...formData, userId: user.id };
    console.log("Form :", checkoutData);

    try {
      await axios.post("http://localhost:8081/api/checkout/save", payload);
      // alert("Checkout details saved successfully!");
      // setStep(2);
      return true;
    } catch (error) {
      // console.error("Error saving checkout details", error);
      // alert("Failed to save checkout details.");
      return false;
    }
  };


  return (
    <>
      <div className="bg-[#FFF8F3]">
        <button
          onClick={() => navigate("/cart")}
          className="text-primary ml-[5%] m-12 hover:underline"
        >
          {t("backToList")}
        </button>
        <div className="md:w-[80%] w-[95%] p-4 md:p-20 mx-auto  bg-[#EEE7DA] rounded-lg min-h-screen">

          <h1 className="text-3xl  font-bold mb-4">{t("checkout")}</h1>
          <p className="text-right text-lg font-semibold mb-6">
            {t("orderSubtotal")} {total}
          </p>

          <div className="flex flex-col   md:flex-col  ">
          <div className="flex flex-col  md:flex-col">
          <div className="mb-8">
  <Stepper activeStep={step - 1} alternativeLabel>
    {stepLabels.map((label, index) => (
      <Step key={label} completed={index < step - 1}>
        <StepLabel
          onClick={() => {
            if (index <= step - 1) {
              setStep(index + 1); // Allow only current or previous steps
            }
          }}
          style={{
            cursor: index <= step - 1 ? "pointer" : "not-allowed",
            color: "green",
          }}
        >
          <StepIcon
            style={{
              backgroundColor: index === step - 1 ? "yellow" : index < step - 1 ? "green" : "gray",
              color: "white",
              borderRadius: "50%",
            }}
          />
          {label}
        </StepLabel>
      </Step>
    ))}
  </Stepper>
</div>

    </div>


            <div className="mt-4 bg-white p-6 rounded-lg shadow-md w-full">

              {/* Step 1: Shipping Address */}
              <div className={`border-l-4 p-4 ${step === 1 ? 'border-black' : 'border-gray-300'}`}>
                <h2 className="text-xl font-semibold">{t("step1")}</h2>
                {step === 1 && (
                  <form className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block">
                        {t("firstName")}
                        <input name="firstName" type="text" className="border p-2 rounded w-full" value={formData.firstName || ""} onChange={handleChange} />
                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                      </label>
                      <label className="block">
                        {t("lastName")}
                        <input name="lastName" type="text" className="border p-2 rounded w-full" value={formData.lastName || ""} onChange={handleChange} />
                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                      </label>
                    </div>
                    <label className="block">
                      {t("address1")}
                      <input name="address1" type="text" className="border p-2 rounded w-full" value={formData.address1 || ""} onChange={handleChange} />
                      {errors.address1 && <p className="text-red-500 text-sm">{errors.address1}</p>}
                    </label>
                    <label className="block">
                      {t("address2")}
                      <input name="address2" type="text" className="border p-2 rounded w-full" value={formData.address2 || ""} onChange={handleChange} />
                    </label>
                    <label className="block">
                      {t("mobileNumber")}
                      <input name="mobile" type="text" className="border p-2 rounded w-full" value={formData.mobile || ""} onChange={handleChange} />
                      {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="block">
                        {t("zipCode")}
                        <input name="zip" type="text" className="border p-2 rounded w-full" value={formData.zip || ""} onChange={handleChange} />
                        {errors.zip && <p className="text-red-500 text-sm">{errors.zip}</p>}
                      </label>
                      <label className="block">
                        {t("city")}
                        <input name="city" type="text" className="border p-2 rounded w-full" value={formData.city || ""} onChange={handleChange} />
                        {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                      </label>
                      <label className="block">
                        {t("state")}
                        <select name="state" className="border p-2 rounded w-full" value={formData.state || ""} onChange={handleChange}>
                          <option value="">{t("selectState")}</option>
                          <option value="GUJ"> {t("gujarat")}</option>
                          <option value="MH"> {t("maharashtra")}</option>
                          <option value="RJ"> {t("rajasthan")}</option>
                        </select>
                        {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const isValid = validateStep1();
                        if (!isValid) return;

                        console.log("Form Data:", formData);

                        const isSubmitted = await Submit();

                        if (isSubmitted) {
                          Swal.fire({
                            title: "Success!",
                            text: "Form submitted successfully.",
                            icon: "success",
                            confirmButtonText: "OK"
                          }).then(() => {
                            setStep(2);
                          });
                        } else {
                          Swal.fire({
                            title: "Error",
                            text: "Failed to submit form. Please try again.",
                            icon: "error",
                            confirmButtonText: "Retry"
                          });
                        }
                      }}
                      className="bg-black text-white py-2 px-4 rounded w-full md:w-auto"
                    >
                      {t("continueToShipping")}
                    </button>

                  </form>
                )}
              </div>

              {/* Step 2 */}
              {/* Step 2 */}
              <div className={`border-l-4 p-4 mt-4 ${step === 2 ? 'border-black' : 'border-gray-300'}`}>
                <h2 className="text-xl font-semibold">{t("step2")}</h2>
                {step === 2 && (
                  <div className="mt-4 space-y-4">
                    <div className="border p-4 rounded bg-gray-50 flex justify-between items-center">
                      <div>
                        <input type="radio" id="standard" name="shipping" defaultChecked className="mr-2" />
                        <label htmlFor="standard" className="font-medium">{t("standardShipping")}</label>
                      </div>
                      <div className="text-sm font-semibold text-gray-800">₹20</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-black text-white py-2 px-4 rounded w-full md:w-auto"
                    >
                      {t("continueToPayment")}
                    </button>
                  </div>
                )}
              </div>


              {/* Step 3 */}
              <div className={`border-l-4 p-4 mt-4 ${step === 3 ? 'border-black' : 'border-gray-300'}`}>
                <h2 className="text-xl font-semibold">{t("step3")}</h2>
                {step === 3 && (
                  <div className="mt-4 space-y-4">

                    {/* Full Name */}
                    <input
                      type="text"
                      placeholder="Full Name (First + Last)"
                      className="border p-2 rounded w-full"
                      value={`${formData.firstName || ''} ${formData.lastName || ''}`}
                      readOnly
                    />

                    {/* Mobile Number */}
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      className="border p-2 rounded w-full"
                      value={formData.mobile || ''}
                      readOnly
                    />

                    {/* Email Address */}
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="border p-2 rounded w-full"
                      value={user.email}
                      readOnly
                    />

                    <button
                      type="button"
                      onClick={handleRazorpayPayment}
                      className="bg-black text-white py-2 px-4 rounded w-full md:w-auto"
                    >
                      {t("payNow")}
                    </button>
                    {paymentId && (
                      <div className="p-4 border rounded bg-white">
                        <p className="mb-2">{t("paymentId")}{paymentId}</p>
                        <button
                          onClick={handleRefund}
                          disabled={refundDone}
                          className={`${refundDone ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                            } text-white px-4 py-2 rounded`}
                        >
                          {refundDone ? t("refunded") : t("refundPayment")}
                        </button>
                        {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
                      </div>
                    )}


                  </div>
                )}
              </div>

              {/* Step 4 */}
              <div className={`border-l-4 p-4 mt-4 ${step === 4 ? 'border-black' : 'border-gray-300'}`}>
                <h2 className="text-xl font-semibold">{t("step4")}</h2>
                {step === 4 && (
                  <div className="mt-4 space-y-6">
                    {/* Shipping Details */}
                    <div className="bg-gray-50 p-4 rounded shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">{t("shippingAddress")}</h3>
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address1}</p>
                      {formData.address2 && <p>{formData.address2}</p>}
                      <p>{formData.city}, {formData.state} - {formData.zip}</p>
                      <p>{t("mobile")}: {formData.mobile}</p>
                    </div>

                    {/* Shipping Method */}
                    <div className="bg-gray-50 p-4 rounded shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">{t("shippingMethod")}</h3>
                      <p>{t("standardShipping")}</p>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-4 rounded shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">{t("paymentSummary")}</h3>
                      <p>{t("paymentId")} :  <span className="font-mono text-sm">{paymentId || "Not Paid Yet"}</span></p>
                      <p>{t("amountPaid")}{amount}</p>
                      <p>{t("email")} : {user.email}</p>
                    </div>

                    {/* Final Place Order Button */}
                    <button
                      type="submit"
                      className="bg-black hover:bg-gray-800 text-white py-2 px-6 rounded shadow-md transition"
                      onClick={() => navigate("/orders", { state: { currentOrderId } })}
                    >
                      Check your order
                    </button>
                  </div>

                )}
              </div>

            </div>
          </div>
        </div>
      </div>

    </>
  );
}
