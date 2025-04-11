import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";








export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [productMap, setProductMap] = useState({});
  const location = useLocation();
  const DEFAULT_IMAGE = "https://dummyimage.com/150x150/ccc/000.png&text=No+Image";
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pastOrderslength, setPastOrderslength] = useState(0);
  const currentOrderId =
    location.state?.currentOrderId || localStorage.getItem("currentOrderId");
  const user = JSON.parse(localStorage.getItem("user"));

  const [recentOrders, setRecentOrders] = useState([]);

// let pastOL= 0;
  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8081/api/checkout/orders/${user.id}`
        );
        setOrders(res.data);
        setPastOrderslength(res.data.length);
        console.log(res.data.length);
      } catch (err) {
        console.error("Error fetching orders", err);
      }
    };
    fetchOrders();
  }, [user.id]);



  const cancelOrder = async (orderId ,productId) => {
    console.log("Canceling order:", orderId, productId);
    try {
      const response = await fetch(`http://localhost:8081/api/checkout/order/${orderId}/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        toast.success("Order cancelled successfully!");
        // Optional: Refresh orders from backend or filter out the cancelled one
        setRecentOrders(prev => prev.filter(order => order.orderid !== orderId));
      } else {
        toast.error("Failed to cancel order. Try again!");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Something went wrong!");
    }
  };
  
  // Fetch product details for unique product IDs
  useEffect(() => {
    const fetchProductDetails = async () => {
      const productIds = [...new Set(orders.map((order) => order.productid))];

      const productData = {};
      await Promise.all(
        productIds.map(async (id) => {
          try {
            const res = await axios.get(
              `http://localhost:8081/api/products/${id}`
            );
            productData[id] = res.data;
          } catch (error) {
            console.error(`Error fetching product ${id}`, error);
          }
        })
      );
      setProductMap(productData);
    };

    if (orders.length > 0) fetchProductDetails();
  }, [orders]);

  useEffect(() => {
    if (orders.length && currentOrderId) {
      const filtered = orders.filter(order => order.orderid === currentOrderId);
      setRecentOrders(filtered);
    }
  }, [currentOrderId, orders]);
  
  const pastOrders = orders.filter(
    (order) => order.orderid !== currentOrderId
  );

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <div>
        <div className=" w-[80%] mx-auto p-6 bg-gray-100 min-h-screen font-sans">

          <h2 className="text-3xl font-semibold mb-6 justify-self-center text-gray-800">My Orders</h2>
          <div className="m-10">
            <button onClick={() => navigate("/list")} className="text-primary hover:underline">
              {t("backToList")}      </button>


          </div>
          {recentOrders.length > 0 && (
  <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
    {/* Order Summary Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <p className="text-sm text-gray-500">
          Order Placed: {formatDate(recentOrders[0].orderdate)}
        </p>
        <p className="text-sm font-medium text-gray-600">
          Order #{recentOrders[0].orderid}
        </p>
      </div>
      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm mt-4 sm:mt-0">
        Trake Order
      </button>
    </div>

    {/* Products */}
    <div className="grid gap-6">
      {recentOrders.map((order, index) => {
        const product = productMap[order.productid];
        return (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-6"
          >
            {/* Image */}
            <div className="flex justify-center md:col-span-1">
              {product?.imageUrls?.length > 0 ? (
                <img
                  src={product.imageUrls[0]}
                  alt={product.name}
                  className="w-full max-w-[150px] h-40 object-cover rounded-xl border border-gray-300 shadow-md"
                />
              ) : (
                <img
                  src={DEFAULT_IMAGE}
                  alt="No Image"
                  className="w-full max-w-[150px] h-40 object-cover rounded-xl border border-gray-300 shadow-md"
                />
              )}
            </div>

            {/* Details */}
            <div className="md:col-span-2 flex flex-col justify-between">
              <div>
                <p className="font-bold text-xl sm:text-2xl text-gray-800">
                  {product?.name?.[language] ||
                    order.productname?.[language] ||
                    { en: "ennn", guj: "GUJ", hi: "hi" }[language]}
                </p>
                <p className="text-gray-500 text-sm sm:text-base">
                  {product?.details}
                </p>
                <p className=" mt-4">Qty: {order.quantity}</p>
                <p className="mt-1 text-xl font-semibold text-black">
                 Price : ₹ {order.price}
                </p>
              </div>
              {/* <div className="text-sm sm:text-base text-gray-600 mt-2">
                <p>Qty: {order.quantity}</p>
                <p className="mt-1 text-lg font-semibold text-black">
                  ₹ {order.price}
                </p>
              </div> */}
            </div>

            {/* Delivery Info */}
            <div className="md:text-bottom flex  md:items-end  mr-4 items-end justify-between flex-col  md:col-span-1">
            <div className=" bg-gray-300 px-4 py-2 font-semibold rounded">
              <button onClick={() => cancelOrder( order.orderid,order.productid )}>Cancel order</button>
            </div>
              <div className="text-right mt-4 md:mt-0">
              <p className="text-xl text-gray-500">Delivery Expected by</p>
              <p className="text-base sm:text-lg font-medium text-gray-700">
                24 April 2025
              </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Total */}
    <div className="flex justify-end border-t pt-4 mt-6">
      <p className="font-semibold text-gray-800 mr-4 text-lg">
        Total: ₹{" "}
        {recentOrders.reduce((sum, item) => sum + item.price, 0)}
      </p>
    </div>
  </div>
)}
<div className="flex justify-between">
  
<h3 className=" font-semibold text-gray-700 justify-self-center text-4xl mb-4">📦 Past Orders</h3>
          <h3 className="text-2xl">Total Orders : {pastOrderslength}</h3>
</div>
          {pastOrders.length > 0 ? (

            pastOrders.map((order, index) => {
              const product = productMap[order.productid];
              return (
                <div
                  key={index}
                  className=" m-4"
                >
                  <div className="flex ml-4 justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order Placed: {formatDate(order.orderdate)}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        Order #{order.orderid}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-start gap-4  pt-4 mb-4">
                    {/* Product Image */}

                    <div className=" flex justify-center">
                      {product && Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-[90%] h-40 object-cover rounded-xl border-2 border-gray-300 shadow-lg transition-transform transform hover:scale-105"
                        />
                      ) : (
                        <img
                          src={DEFAULT_IMAGE}
                          alt="No Image"
                          className="w-40 h-40 object-cover rounded-xl border-2 border-gray-300 shadow-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1 mt-4">
                      <p className="font-bold text-2xl text-gray-800 mb-1">
                        {(product?.name?.[language]) || order.productname?.[language] || { en: "ennn", guj: "GUJ", hi: "hi" }[language]}
                      </p>
                      <p className="text-lg text-gray-500">{product?.details}</p>
                      <div className="text-sm text-gray-600 mt-2">

                        <p className="text-lg">Qty: {order.quantity}</p>
                        <p className="text-xl mt-2">Rs. {order.price}</p>
                      </div>
                    </div>
                    <div className="text-right mt-4 mr-4">
                      <p className="text-green-600 font-semibold text-2xl mb-1">Delivered</p>
                      <p className=" text-gray-500 text-xl">Delivered On</p>
                      <p className="text-xl font-medium text-gray-700">
                        {formatDate(order.orderdate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end border-t pt-4 mt-4">
                    {/* <p className="font-semibold text-gray-800">Rs. {order.price}</p> */}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No past orders found.</p>
          )}

        </div>
      </div>
    </>
  );
}
