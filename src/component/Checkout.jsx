import { useState , useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";


export default function Checkout() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const total = location.state?.total || 0;

  const [paymentId, setPaymentId] = useState("");
  const [refundDone, setRefundDone] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);


  const [message, setMessage] = useState("");
// const paymentId = "pay_QG4m2r50MkMGVc";
const handleRefund = async () => {
  try {
    const res = await axios.post("http://localhost:8081/api/checkout/refund", {
      paymentId,
    });
    console.log(res.data);
    setMessage("Refund successful!");
    setRefundDone(true); // disable button
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
  
  const amount = total;
  console.log("Cart Total:", amount);



  const handleRazorpayPayment = async () => {

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
            const paymentPayload = {
              userid: user.id,
              paymentid: response.razorpay_payment_id,
              orderid: response.razorpay_order_id,
              status: "success" ,
              amount: amount,
            };
        console.log("Payment Payload:", paymentPayload);
            await axios.post("http://localhost:8081/api/checkout/payment-details", paymentPayload);
        
            Swal.fire({
              icon: "success",
              title: "Payment Successful",
              text: "Your payment has been processed and recorded.",
            });
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
    const requiredFields = ["firstName", "lastName", "address1", "mobile", "zip", "city", "state"];
    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = "This field is required.";
    });
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
      alert("Checkout details saved successfully!");
      setStep(2);
    } catch (error) {
      console.error("Error saving checkout details", error);
      alert("Failed to save checkout details.");
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <p className="text-right text-lg font-semibold mb-6">
        Order Subtotal : {total}
      </p>

      <div className="flex flex-col md:flex-row">
        <div className="flex md:flex-col items-center md:mr-6 mb-4 md:mb-0">
          {[1, 2, 3, 4].map((num) => (

            <div
              key={num}
              className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer mb-4 ${step === num ? 'bg-black text-white' : 'bg-gray-300'}`}
              onClick={() => setStep(num)}
            >
              {num}
            </div>

          ))}
        </div>

        <div className="mt-4 bg-white p-6 rounded-lg shadow-md w-full">

          {/* Step 1: Shipping Address */}
          <div className={`border-l-4 p-4 ${step === 1 ? 'border-black' : 'border-gray-300'}`}>
            <h2 className="text-xl font-semibold">1. Shipping address</h2>
            {step === 1 && (
              <form className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    First Name *
                    <input name="firstName" type="text" className="border p-2 rounded w-full" value={formData.firstName || ""} onChange={handleChange} />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                  </label>
                  <label className="block">
                    Last Name *
                    <input name="lastName" type="text" className="border p-2 rounded w-full" value={formData.lastName || ""} onChange={handleChange} />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                  </label>
                </div>
                <label className="block">
                  Address 1 - Street or P.O. Box *
                  <input name="address1" type="text" className="border p-2 rounded w-full" value={formData.address1 || ""} onChange={handleChange} />
                  {errors.address1 && <p className="text-red-500 text-sm">{errors.address1}</p>}
                </label>
                <label className="block">
                  Address 2 - Apt, Suite, Floor
                  <input name="address2" type="text" className="border p-2 rounded w-full" value={formData.address2 || ""} onChange={handleChange} />
                </label>
                <label className="block">
                  Mobile Number *
                  <input name="mobile" type="text" className="border p-2 rounded w-full" value={formData.mobile || ""} onChange={handleChange} />
                  {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block">
                    ZIP Code *
                    <input name="zip" type="text" className="border p-2 rounded w-full" value={formData.zip || ""} onChange={handleChange} />
                    {errors.zip && <p className="text-red-500 text-sm">{errors.zip}</p>}
                  </label>
                  <label className="block">
                    City *
                    <input name="city" type="text" className="border p-2 rounded w-full" value={formData.city || ""} onChange={handleChange} />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                  </label>
                  <label className="block">
                    State *
                    <select name="state" className="border p-2 rounded w-full" value={formData.state || ""} onChange={handleChange}>
                      <option value="">Select State</option>
                      <option value="GUJ">Gujarat</option>
                      <option value="MH">Maharastra</option>
                      <option value="RJ">Rajasthan</option>
                    </select>
                    {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1())
                      console.log("Form Data:", formData);
                    Submit();
                    setStep(2);
                  }}

                  className="bg-black text-white py-2 px-4 rounded w-full md:w-auto"
                >
                  Continue to shipping method
                </button>
              </form>
            )}
          </div>

          {/* Step 2 */}
         {/* Step 2 */}
<div className={`border-l-4 p-4 mt-4 ${step === 2 ? 'border-black' : 'border-gray-300'}`}>
  <h2 className="text-xl font-semibold">2. Shipping method</h2>
  {step === 2 && (
    <div className="mt-4 space-y-4">
      <div className="border p-4 rounded bg-gray-50 flex justify-between items-center">
        <div>
          <input type="radio" id="standard" name="shipping" defaultChecked className="mr-2" />
          <label htmlFor="standard" className="font-medium">Standard Shipping</label>
        </div>
        <div className="text-sm font-semibold text-gray-800">₹20</div>
      </div>
      <button
        type="button"
        onClick={() => setStep(3)}
        className="bg-black text-white py-2 px-4 rounded w-full md:w-auto"
      >
        Continue to payment
      </button>
    </div>
  )}
</div>


          {/* Step 3 */}
          <div className={`border-l-4 p-4 mt-4 ${step === 3 ? 'border-black' : 'border-gray-300'}`}>
          <h2 className="text-xl font-semibold">3. Payment</h2>
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
  Pay Now with Razorpay
</button>
{paymentId && (
  <div className="p-4 border rounded bg-white">
    <p className="mb-2">Payment ID: {paymentId}</p>
    <button
      onClick={handleRefund}
      disabled={refundDone}
      className={`${
        refundDone ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
      } text-white px-4 py-2 rounded`}
    >
      {refundDone ? "Refunded" : "Refund Payment"}
    </button>
    {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
  </div>
)}


              </div>
            )}
          </div>

          {/* Step 4 */}
          <div className={`border-l-4 p-4 mt-4 ${step === 4 ? 'border-black' : 'border-gray-300'}`}>
            <h2 className="text-xl font-semibold">4. Review & place order</h2>
            {step === 4 && (
              <div className="mt-4 space-y-6">
              {/* Shipping Details */}
              <div className="bg-gray-50 p-4 rounded shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                <p>{formData.firstName} {formData.lastName}</p>
                <p>{formData.address1}</p>
                {formData.address2 && <p>{formData.address2}</p>}
                <p>{formData.city}, {formData.state} - {formData.zip}</p>
                <p>Mobile: {formData.mobile}</p>
              </div>
            
              {/* Shipping Method */}
              <div className="bg-gray-50 p-4 rounded shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Shipping Method</h3>
                <p>Standard Shipping - ₹20</p>
              </div>
            
              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
                <p>Payment ID: <span className="font-mono text-sm">{paymentId || "Not Paid Yet"}</span></p>
                <p>Total Amount Paid: ₹{amount}</p>
                <p>Email: {user.email}</p>
              </div>
            
              {/* Final Place Order Button */}
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white py-2 px-6 rounded shadow-md transition"
                onClick={() => Swal.fire("Order Placed!", "Your order has been successfully placed.", "success")}
              >
                Confirm & Place Order
              </button>
            </div>
            
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
