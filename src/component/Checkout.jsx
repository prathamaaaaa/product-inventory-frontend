import { useState } from "react";
import axios from "axios";

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
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
        Order subtotal (2 items): $300.00
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
          <div className={`border-l-4 p-4 mt-4 ${step === 2 ? 'border-black' : 'border-gray-300'}`}>
            <h2 className="text-xl font-semibold">2. Shipping method</h2>
            {step === 2 && (
              <div className="mt-4 space-y-4">
                <div className="border p-4 rounded bg-gray-50">
                  <input type="radio" id="standard" name="shipping" defaultChecked className="mr-2" />
                  <label htmlFor="standard">Standard Shipping - Free</label>
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
                <input type="text" placeholder="Card Number" className="border p-2 rounded w-full" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Expiry Date (MM/YY)" className="border p-2 rounded w-full" required />
                  <input type="text" placeholder="CVV" className="border p-2 rounded w-full" required />
                </div>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="bg-black text-white py-2 px-4 rounded w-full md:w-auto"
                >
                  Review & place order
                </button>
              </div>
            )}
          </div>

          {/* Step 4 */}
          <div className={`border-l-4 p-4 mt-4 ${step === 4 ? 'border-black' : 'border-gray-300'}`}>
            <h2 className="text-xl font-semibold">4. Review & place order</h2>
            {step === 4 && (
              <div className="mt-4 space-y-4">
                <p className="text-gray-700">Please review your details and confirm the order.</p>
                <button
                  type="submit"
                  className="bg-black text-white py-2 px-4 rounded w-full md:w-auto"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
