import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function List() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const DEFAULT_IMAGE = "https://dummyimage.com/150x150/ccc/000.png&text=No+Image";
  const location = useLocation();
  const [copySuccess, setCopySuccess] = useState(false);
  const isAdminPanel = location.pathname.startsWith("/admin");
  const navigate = useNavigate();
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [admin, setAdmin] = useState(() => {
    const storedAdmin = localStorage.getItem("admin");
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  });


  function CopyUrl() {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch((err) => console.error("Error copying:", err));
  }
  useEffect(() => {
    axios.get("http://localhost:8081/api/products/all")
      .then(response => {
        console.log("API Response:", response.data);
        setProducts(response.data.products || []);
        setFilteredProducts(response.data.products || []);
        setCategories(response.data.categories || []);
        setSubCategories(response.data.subCategories || []);
        setLoading(false);

        console.log("location", location.pathname);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryName === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubCategory) {
      filtered = filtered.filter(product => product.subCategoryName === selectedSubCategory);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedSubCategory, products]);

  useEffect(() => {
    if (selectedCategory) {

      const updatedSubCategories = subCategories.filter(
        (subCategory) => subCategory.categoryName === selectedCategory
      );

      setFilteredSubCategories(updatedSubCategories);
      setFilteredProducts(products.filter((product) => product.categoryName === selectedCategory));
      setSelectedSubCategory("");
    } else {

      setFilteredProducts(products);
      setFilteredSubCategories([]);
    }
  }, [selectedCategory, subCategories, products]);


  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error loading products. Try again later.</p>;

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8081/admin/list/${id}`)
          .then(() => {
            Swal.fire("Deleted!", "Your item has been deleted.", "success");

            setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
            setFilteredProducts((prevFiltered) => prevFiltered.filter((p) => p.id !== id));


            setTimeout(() => window.location.reload(), 1000);
          })
          .catch((error) => {
            console.error("Error deleting product:", error);
            Swal.fire("Error!", "An error occurred while deleting the item.", "error");
          });
        // Swal.fire("Deleted!", "Your item has been deleted.", "success");
      }
    });
  }
  const toggleProductStatus = async (productId) => {
    try {
      // 🔥 Optimistic UI Update - Update Active Status Locally First
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, active: !product.active } : product
        )
      );

      // 📡 Send API request to backend
      await axios.put(`http://localhost:8081/api/products/toggle-active/${productId}`);

      // 🔄 Fetch the updated product list after successful toggle
      const response = await axios.get("http://localhost:8081/api/products/all");
      setProducts(response.data.products || []);
      setFilteredProducts(response.data.products || []);

      console.log("Product status updated successfully!", response.data);
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("Failed to update product status. Please try again.");

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, active: !product.active } : product
        )
      );
    }
  };




  return (


    <div className="bg-gray-50 text-gray-900 min-h-screen p-8">

      {/* header sections  */}
      <div className="bg-white p-6 lg:mx-10 mb-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-extrabold p-2 text-gray-800">📦 Product List</h1>
        <span className="text-gray-700 font-medium">Admin ID: {admin?.id || "Loading..."}</span>

        {location.pathname === "/admin/adminpanel" && (
          <Link
            to={`/add`}
            className="mt-4 md:mt-0 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            ➕ Add Product
          </Link>
        )}
      </div>
      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="🔍 Search product..."
          className="p-2 border border-gray-300 rounded-lg w-full md:w-1/3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/*  Category Dropdown */}
        <select
          className="p-2 border border-gray-300 rounded-lg w-full md:w-1/4"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value=""> All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>

        {/*  SubCategory Dropdown */}
        <select
          className="p-2 border border-gray-300 rounded-lg w-full md:w-1/4"
          value={selectedSubCategory}
          onChange={(e) => setSelectedSubCategory(e.target.value)}
          disabled={!selectedCategory}
        >
          <option value="">All Subcategories</option>
          {filteredSubCategories.map((subCategory) => (
            <option key={subCategory.id} value={subCategory.name}>{subCategory.name}</option>
          ))}
        </select>



        {/* Reset Button */}
        <button
          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory("");
            setSelectedSubCategory("");
          }}
        >
          Reset
        </button>
      </div>

      {/*  Product Grid */}


      <div className="mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.length > 0 ? (
          filteredProducts
            .filter(product => isAdminPanel || product.active)
            .filter(product =>
              isAdminPanel ? product.adminid == admin?.id : true
            )
            .map(product => (

              <div key={product.id} className="bg-white p-5 rounded-xl shadow-lg transform transition hover:translate-y-[-5px] hover:shadow-2xl">
                <span>{product.adminid}</span>
                <span>admin{admin?.id}</span>

                {/* Product Name */}
                <h2 className="text-xl font-bold text-gray-800 flex justify-between items-center">
                  <div>
                    <span className="ml-2">{product.name}</span>

                  </div>
                  <div>
                    {location.pathname === "/admin/adminpanel" && (
                      <div className="flex">

                        <span title={product.active ? "Disable Product" : "Enable Product"}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth={2}
                            className="lucide cursor-pointer"
                            onClick={() => toggleProductStatus(product.id)}
                          >
                            {product.active ? (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </>
                            ) : (
                              <>
                                <path d="M17.94 17.94A10.63 10.63 0 0 1 12 20c-7 0-11-8-11-8a19.07 19.07 0 0 1 4.22-5.31" />
                                <path d="M8.53 8.53A3 3 0 0 1 12 9c.3 0 .6 0 .88-.08" />
                                <path d="M1 1l22 22" />
                              </>
                            )}
                          </svg>


                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg"
                          width="24" height="24" viewBox="0 0 24 24"
                          onClick={() => navigate(`/add/${product.id}`)}
                          fill="none" stroke="currentColor" strokeWidth={2}
                          className="lucide  lucide-file-pen-line">
                          <path d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
                          <path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" /><path d="M8 18h1" /></svg>


                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={() => handleDelete(product.id)}  // Ensure product.id is passed correctly
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="lucide text-red-600 lucide-trash-2 cursor-pointer"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>

                      </div>
                    )}
                  </div>
                </h2>

                {/* Product Details */}
                <div className="text-sm text-gray-600 mt-3 space-y-2">
                  <p><strong>💰 Price:</strong> ${product.price}</p>
                  <p><strong>📂 Category:</strong> {product.categoryName || "N/A"}</p>
                  <p><strong>📁 SubCategory:</strong> {product.subCategoryName || "N/A"}</p>
                </div>

                {/* View Details Button */}
                <Link
                  to={isAdminPanel ? `/admin/detail/${product.id}` : `/detail/${product.id}`}
                  className="text-indigo-500 font-semibold hover:underline"
                >
                  🔍 View Details
                </Link>

                {/* Product Image */}
                <div className="mt-4 flex justify-center">
                  {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? (
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

              </div>
            )
            )) : (
          <p className="col-span-full text-center text-gray-600 text-lg">No products found.</p>
        )}
      </div>

      <button onClick={CopyUrl} className="fixed bottom-6 right-6 bg-indigo-600 text-white text-xl p-4 rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" strokeWidth={2} viewBox="0 0 26 24" fill="none" stroke="currentColor" className="lucide  lucide-share-2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
      </button>
      {copySuccess && (
        <div className="fixed bottom-16 right-16 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg transition-opacity">
          URL Copied..!!
        </div>
      )}

    </div>
  );
}

export default List;
