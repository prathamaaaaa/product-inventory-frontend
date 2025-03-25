import React, { useState, useEffect } from "react";
import axios from "axios";

const AddProducts = () => {
  const [type, setType] = useState("category");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [categoryNames, setCategoryNames] = useState([""]);
  const [subCategoryNames, setSubCategoryNames] = useState([""]);
  const [newProducts, setNewProducts] = useState([{ name: "", price: "", images: [""] }]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/products/all")
      .then((response) => {
        setProducts(response.data.products);
        setCategories(response.data.categories);
        setSubCategories(response.data.subCategories);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = "";
    let requestData = {};

    if (type === "category") {
      url = "http://localhost:8081/api/products/save-category";
      requestData = categoryNames;
    } else if (type === "subcategory") {
      url = `http://localhost:8081/api/products/save-subcategory?categoryId=${selectedCategory}`;
      requestData = subCategoryNames;
    } else {
      url = `http://localhost:8081/api/products/save-product?categoryId=${selectedCategory}&subcategoryId=${selectedSubCategory}`;
      requestData = {
        productNames: newProducts.map((p) => p.name),
        prices: newProducts.map((p) => parseFloat(p.price) || 0),
        imageUrls: newProducts.flatMap((p) => p.images.filter((img) => img)),
      };
    }

    try {
      const response = await axios.post(url, requestData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        alert("Success!");
        window.location.reload();
      } else {
        alert("Error submitting data.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed. Check console for details.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Product Management</h1>

      {/* Select Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Type</label>
        <select
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="category">Category</option>
          <option value="subcategory">Subcategory</option>
          <option value="product">Product</option>
        </select>
      </div>

      {/* Display Data */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Data</h2>

        <h3 className="text-xl font-medium mt-4">Categories</h3>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id} className="text-gray-700">{cat.name}</li>
          ))}
        </ul>

        <h3 className="text-xl font-medium mt-4">Subcategories</h3>
        <ul>
          {subCategories.map((sub) => (
            <li key={sub.id} className="text-gray-700">
              {sub.name} (Category: {sub.categories.name})
            </li>
          ))}
        </ul>

        <h3 className="text-xl font-medium mt-4">Products</h3>
        <ul>
          {products.map((prod) => (
            <li key={prod.id} className="text-gray-700">
              {prod.name} - ${prod.price} (Category: {prod.categories.name}, Subcategory: {prod.subCategory.name})
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {/* Category Section */}
        {type === "category" && (
          <div className="bg-gray-50 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700">Add Categories</label>
            {categoryNames.map((name, index) => (
              <input
                key={index}
                type="text"
                value={name}
                onChange={(e) => {
                  const newCategories = [...categoryNames];
                  newCategories[index] = e.target.value;
                  setCategoryNames(newCategories);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 mt-2"
                placeholder="Enter Category"
              />
            ))}
            <button type="button" onClick={() => setCategoryNames([...categoryNames, ""])} className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg">
              + Add More
            </button>
          </div>
        )}

        {/* Subcategory Section */}
        {type === "subcategory" && (
          <div className="bg-gray-50 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700">Select Category</label>
            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 mt-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {subCategoryNames.map((name, index) => (
              <input
                key={index}
                type="text"
                value={name}
                onChange={(e) => {
                  const newSubCategories = [...subCategoryNames];
                  newSubCategories[index] = e.target.value;
                  setSubCategoryNames(newSubCategories);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 mt-2"
                placeholder="Enter Subcategory"
              />
            ))}
            <button type="button" onClick={() => setSubCategoryNames([...subCategoryNames, ""])} className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg">
              + Add More
            </button>
          </div>
        )}

        {/* Product Section */}
        {type === "product" && (
          <div className="bg-gray-50 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700">Select Category</label>
            <select className="w-full px-4 py-3 rounded-xl border border-gray-200" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mt-4">Select Subcategory</label>
            <select className="w-full px-4 py-3 rounded-xl border border-gray-200" value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)}>
              {subCategories
                .filter((sub) => sub.categories.id === parseInt(selectedCategory))
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <button type="submit" className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl">Submit</button>
      </form>
    </div>
  );
};

export default AddProducts;