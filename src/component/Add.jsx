import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

function Add() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;


  const navigate = useNavigate();
    const { t } = useTranslation();
  
  const [type, setType] = useState("category");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [categoryInputs, setCategoryInputs] = useState([""]);
  const [subcategoryInputs, setSubcategoryInputs] = useState([""]);
  const [productInputs, setProductInputs] = useState([{ name: { en: "", guj: "", hi: "" }, details: "", price: "", imageUrls: [""] }]);
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const params = new URLSearchParams(location.search);
  const urlStoreId = params.get("storeId"); // Get storeId from URL if present

  const [selectedStore, setSelectedStore] = useState(""); // Selected Store
  const [stores, setStores] = useState([]); // List of Stores

  const storeId = urlStoreId || selectedStore;
  const { id } = useParams();
  const isEditMode = !!id;


  useEffect(() => {
    console.log("Store ID:", storeId);
  }, [storeId]);

  const [product, setProduct] = useState({
    name: { en: "", guj: "", hi: "" }, // Ensure `name` is an object
    details: "",
    price: "",
    imageUrls: [""]
  });
  const [admin, setAdmin] = useState(() => {
    const storedAdmin = localStorage.getItem("admin");
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  });
  // Fetch data for the given ID when it's available
  useEffect(() => {
    if (id) {
      axios.get(`${BASE_URL}/api/products/${id}`)
        .then(response => {
          console.log("Fetched Data for ID:", id, response.data);
          // setProduct(response.data);

          let parsedName = { en: "", guj: "", hi: "" };

          try {
            parsedName = typeof response.data.name === "string"
              ? JSON.parse(response.data.name)
              : response.data.name;
          } catch (error) {
            console.error("Error parsing name:", error);
            parsedName = { en: "", guj: "", hi: "" }; // Default to empty object
          }

          console.log("Parsed Name Object:", parsedName.en);


          setProduct(prevProduct => ({
            ...prevProduct,
            name: parsedName,
            details: response.data.details || "",
            price: response.data.price || "",
            imageUrls: response.data.imageUrls || [""]
          }));
          setType("product");

          const categoryObj = categories.find(cat => cat.name.toLowerCase() === response.data.categoryName.toLowerCase());
          const subcategoryObj = subCategories.find(sub => sub.name.toLowerCase() === response.data.subCategoryName.toLowerCase());

          setSelectedCategory(categoryObj ? categoryObj.id : "");
          setSelectedSubcategory(subcategoryObj ? subcategoryObj.id : "");

          setProductInputs([
            {
              // name: response.data.name || "",
              name: response.data.name || { en: "", guj: "", hi: "" },

              details: response.data.details || "",
              price: response.data.price || "",
              imageUrls: response.data.imageUrls || [""]
            }
          ]);
        })
        .catch(error => console.error("Error fetching data by ID:", error));
    }
  }, [id, categories, subCategories]);


  useEffect(() => {
    if (selectedCategory) {
      setFilteredSubCategories(subCategories.filter(sub => sub.categoryId === parseInt(selectedCategory)));
    }
  }, [selectedCategory, subCategories]);





  useEffect(() => {
    axios.get(`${BASE_URL}/api/products/all`)
      .then(response => {
        setCategories(response.data.categories || []);
        setSubCategories(response.data.subCategories || []);
        console.log("Categories:", response.data.categories);
        console.log("Subcategories:", response.data.subCategories);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);


  const handleCategoryChange = (e) => {

    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setFilteredSubCategories(subCategories.filter(sub => sub.categoryId === parseInt(categoryId)));
    setSelectedSubcategory("");
  };


  const addMoreCategory = () => setCategoryInputs([...categoryInputs, ""]);
  const addMoreSubcategory = () => setSubcategoryInputs([...subcategoryInputs, ""]);
  // const addMoreProduct = () => setProductInputs([...productInputs, { name: "", details: "", price: "", imageUrls: [""] }]);
  const addMoreProduct = () => {
    setProductInputs([
      ...productInputs,
      { name: { en: "", guj: "", hi: "" }, details: "", price: "", imageUrls: [""] }
    ]);
  };

  const handleCategoryInputChange = (index, value) => {
    let updated = [...categoryInputs];
    updated[index] = value;
    setCategoryInputs(updated);
  };

  const handleSubcategoryInputChange = (index, value) => {
    let updated = [...subcategoryInputs];
    updated[index] = value;
    setSubcategoryInputs(updated);
  };

  // const handleProductInputChange = (index, field, value) => {
  //   let updated = [...productInputs];
  //   updated[index][field] = value;
  //   setProductInputs(updated);
  // };
  const handleProductInputChange = (index, field, value, lang = null) => {
    let updated = [...productInputs];

    if (field === "name" && lang) {
      updated[index].name = { ...updated[index].name, [lang]: value };
    } else {
      updated[index][field] = value;
    }


    setProductInputs(updated);
  };

  const handleImageChange = (productIndex, imageIndex, value) => {
    let updated = [...productInputs];
    updated[productIndex].imageUrls[imageIndex] = value;
    setProductInputs(updated);
  };

  const addMoreImageUrl = (productIndex) => {
    let updated = [...productInputs];
    updated[productIndex].imageUrls.push("");
    setProductInputs(updated);
  };
  useEffect(() => {
    if (admin && admin.id) {
      axios.get(`${BASE_URL}/api/stores/admin/${admin.id}`)
        .then(response => {
          setStores(response.data);
        })
        .catch(error => console.error("Error fetching stores:", error));
    }
  }, [admin]); // Runs when `admin` changes

  const handleStoreChange = (e) => {
    setSelectedStore(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload;
    if (!storeId) {
      alert("Please select a store before submitting.");
      return;
    }

    if (!admin || !admin.id) {
      alert("Error: Admin ID is missing. Please log in again.");
      return;
    }
    if (type === "category") {
      payload = {
        adminId: admin.id,
        storeId: Number(storeId) || 0,
        categoryNames: categoryInputs.filter(name => name.trim() !== "")
      };

      console.log("Submitting Category Payload:", payload);

      axios.post(`${BASE_URL}/api/products/save-category`, payload, {
        headers: { "Content-Type": "application/json" }
      })
        .then(() => navigate("/admin/store"))
        .catch(error => console.error("Error saving category:", error));
    }

    else if (type === "subcategory") {
      if (!selectedCategory) {
        alert("Please select a category first.");
        return;
      }

      payload = {
        adminId: admin.id,
        categoryId: selectedCategory,
        storeId: Number(storeId) || 0,
        subcategoryNames: subcategoryInputs.filter(name => name.trim() !== "")
      };

      console.log("Submitting Subcategory Payload:", payload);

      axios.post(`${BASE_URL}/api/products/save-subcategory`, payload, {
        headers: { "Content-Type": "application/json" }
      })
        .then(() => navigate("/admin/store"))
        .catch(error => console.error("Error saving subcategory:", error));
    }

    else if (type === "product") {
      e.preventDefault();
      const categoryId = selectedCategory ? Number(selectedCategory) : null;
      const subcategoryId = selectedSubcategory ? Number(selectedSubcategory) : null;

      if (admin.id === null || admin.id === undefined) {
        alert("Error: Admin ID is missing. Please log in again.");
        return;

      }


      let payload = {};
      if (isEditMode) {

        payload = {
          adminId: admin.id,
          // name: productInputs[0].name.trim(),
          productNames: {
            en: productInputs[0]?.name?.en?.trim() || "Default EN",
            guj: productInputs[0]?.name?.guj?.trim() || "Default GUJ",
            hi: productInputs[0]?.name?.hi?.trim() || "Default HI"
          }

          , details: productInputs[0].details.trim(),
          price: Number(productInputs[0].price),
          categoryId,
          subcategoryId,
          storeId: Number(storeId) || 0,
          imageUrls: productInputs[0].imageUrls.filter(url => url.trim() !== ""),
          active: true,
        }; console.log("Updating Product with Payload:", payload);

        axios.put(`${BASE_URL}/api/products/update/${id}`, payload, {
          headers: { "Content-Type": "application/json" }
        })
          .then(response => {
            console.log("Product updated successfully:", response.data);
            alert("Product Updated Successfully!");
            navigate(`/admin/store/`);
          })
          .catch(error => console.error("Error updating product:", error));

      } else {
        payload = {
          adminId: admin.id,
          productNames: productInputs.map(product => product.name),
          details: productInputs.map(product => product.details.trim()),
          prices: productInputs.map(product => Number(product.price)),
          categoryId,
          subcategoryId,
          storeId: Number(storeId) || 0,
          imageUrls: productInputs.map(product => product.imageUrls.filter(url => url.trim() !== "")),

        };

        console.log("Submitting Product Payload:", payload);
        axios.post(`${BASE_URL}/api/products/save-product`, payload, {

          headers: { "Content-Type": "application/json" }
        })
          .then(() => {
            alert("Product Saved Successfully!");
            navigate("/admin/store");
          })
          .catch(error => {
            console.error("Error saving product:", error);
            if (error.response) {
              console.error("Backend Response:", error.response.data);
            }
          });
      }
    };
  };



  const removeCategory = (index) => {
    let updated = [...categoryInputs];
    updated.splice(index, 1);
    setCategoryInputs(updated);
  };

  const removesubCategory = (index) => {
    let updated = [...subcategoryInputs];
    updated.splice(index, 1);
    setSubcategoryInputs(updated);
  };

  const removeProducts = (index) => {
    let updated = [...productInputs];
    updated.splice(index, 1);
    setProductInputs(updated);
  };

  return (
    <div className=" min-h-screen p-8 text-dark">
      <h1 className="text-4xl font-bold mb-6 text-center">{t("productManagement")}</h1>
      <button onClick={() => navigate("/admin/store")} className="text-primary hover:underline">
      {t("backToList")}
            </button>

      <form onSubmit={handleSubmit} className="bg-gray-100 rounded-2xl justify-self-center w-[70%] shadow-lg p-6 mt-6 space-y-6">

        <div className="flex items-center">
          <label className="block w-60 text-lg">{t("selectStorePlaceholder")}</label>
          <select value={selectedStore} onChange={handleStoreChange} className="w-full bg-gray-200 p-3 border rounded-lg">
            <option value="">{t("selectStorePlaceholder")}</option>
            {stores.map(store => <option key={store.id} 
            value={store.id}>
          {JSON.parse(store.name)[language] || JSON.parse(store.name)["en"]}
          </option>)}
          </select>
        </div>


        {/* Type Selection */}
        <div className="flex items-center">
          <label className="block w-60 text-lg">{t("selectType")}</label>
          <select

            value={type}
            onChange={(e) => setType(e.target.value)} className="w-full bg-gray-200 p-3 border rounded-lg">
            <option value="category">{t("category")}</option>
            <option value="subcategory">{t("subcategory")}</option>
            <option value="product">{t("product")}</option>
          </select>
        </div>

        {/* Category Section */}
        {type === "category" && (
          <div>
            {categoryInputs.map((category, index) => (
              <div className="flex items-center">
                <label className="block w-60  text-lg">{t("enterCategory")}</label>
                <input key={index} type="text" value={category} onChange={e => handleCategoryInputChange(index, e.target.value)}
                  className="w-full p-3 border  rounded-lg m-2" placeholder={t("enterCategory")}   />
                {categoryInputs.length > 1 && (
                  <button
                    type="button"
                    className="text-red-600 font-bold text-lg px-2"
                    onClick={() => removeCategory(index)}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addMoreCategory} className="bg-purple-700  hover:bg-purple-950 my-4 text-white px-4 py-2 rounded-lg">
            {t("addMoreCategories")}
            </button>
          </div>
        )}

        {/* Subcategory Section */}
        {type === "subcategory" && (
          <div>
            <div className="flex  items-center">
              <label className="block w-60  text-lg">{t("selectCategory")}</label>
              <select value={selectedCategory} onChange={handleCategoryChange}
                className="w-full bg-gray-200 mb-4 p-3 border rounded-lg">

                <option value="">{t("selectCategory")}</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>


            {subcategoryInputs.map((sub, index) => (
              <div className="flex items-center">
                <label className="block w-60 text-lg">{t("selectSubcategory")}</label>
                <input key={index} type="text" value={sub} onChange={e => handleSubcategoryInputChange(index, e.target.value)}
                  className="w-full p-3 border rounded-lg m-2" placeholder={t("selectSubcategoryPlaceholder")} />
                {subcategoryInputs.length > 1 && (
                  <button
                    type="button"
                    className="text-red-600 font-bold text-lg px-2"
                    onClick={() => removesubCategory(index)}
                  >
                    ❌
                  </button>
                )}
              </div>

            ))}

            <button type="button" onClick={addMoreSubcategory} className="bg-purple-700 hover:bg-purple-950 my-4 text-white px-4 py-2 rounded-lg">
            {t("addMoreSubcategories")}            </button>
            {/* <span>{storeId}</span> */}
          </div>
        )}

        {/* Product Section */}
        {type === "product" && (
          <div>
            <div className="flex my-2 items-center">
              <label className="block w-60 text-lg">{t("selectCategory")} </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full p-3 bg-gray-200 border rounded-lg"
              >
                <option value="">{t("selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

            </div>


            <div className="flex my-2 items-center">
              <label className="block w-60 text-lg">{t("selectSubcategory")}</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full bg-gray-200 p-3 border rounded-lg"
              >
                <option value="">{t("selectSubcategory")}</option>
                {filteredSubCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>

            </div>


            {productInputs.map((product, index) => (
              <div key={index} className="m-4 p-3 border rounded-lg">
                <div className="flex m-2 items-center">
                  {/* <label className="block w-70 text-lg">Enter Product Name :</label>
                  <input type="text" value={product.name} onChange={e => handleProductInputChange(index, "name", e.target.value)}
                    className="w-full p-3 border rounded-lg mb-2" placeholder="Enter Product Name" /> */}
                  <div className="flex m-2 items-center">
                    <label className="block w-70 text-lg">{t("enterProductNameEn")}</label>
                    <input type="text"
  value={typeof product.name === "string" ? JSON.parse(product.name).en || "" : product.name.en || ""}
                        onChange={e => handleProductInputChange(index, "name", e.target.value, "en")}
                      className="w-full p-3 border rounded-lg mb-2" placeholder={t("enterProductNameEnPlaceholder")} />
                  </div>

                  <div className="flex m-2 items-center">
                    <label className="block w-70 text-lg">{t("enterProductNameGuj")}</label>
                    <input type="text" 
  value={typeof product.name === "string" ? JSON.parse(product.name).guj || "" : product.name.guj || ""}
                      onChange={e => handleProductInputChange(index, "name", e.target.value, "guj")}
                      className="w-full p-3 border rounded-lg mb-2" placeholder={t("enterProductNameGujPlaceholder")} />
                  </div>

                  <div className="flex m-2 items-center">
                    <label className="block w-70 text-lg">{t("enterProductNameHi")}</label>
                    <input type="text" 
  value={typeof product.name === "string" ? JSON.parse(product.name).hi || "" : product.name.hi || ""}                    onChange={e => handleProductInputChange(index, "name", e.target.value, "hi")}
                      className="w-full p-3 border rounded-lg mb-2" placeholder={t("enterProductNameHiPlaceholder")} />
                  </div>

                </div>
                <div className="flex m-2 items-center">
                  <label className="block w-70 text-lg">{t("enterProductDetails")}</label>
                  <input type="text" value={product.details} onChange={e => handleProductInputChange(index, "details", e.target.value)}
                    className="w-full p-3 border rounded-lg mb-2" placeholder={t("enterProductDetailsPlaceholder")} />
                </div>
                <div className="flex m-2 items-center">
                  <label className="block w-70 text-lg">{t("enterProductPrice")}</label>
                  <input type="number" value={product.price} onChange={e => handleProductInputChange(index, "price", e.target.value)}
                    className="w-full p-3 border rounded-lg mb-2" placeholder={t("enterProductPricePlaceholder")} />
                </div>

                {product.imageUrls.map((url, imgIndex) => (
                  <div key={imgIndex} className="flex m-2 items-center">
                    <label className="block w-70 text-lg">{t("enterImageUrl")}</label>
                    <input key={imgIndex} type="text" value={url} onChange={e => handleImageChange(index, imgIndex, e.target.value)}
                      className="w-full p-3 border rounded-lg mb-2" placeholder={t("enterImageUrlPlaceholder")} />

                  </div>

                ))}

                <button type="button" onClick={() => addMoreImageUrl(index)} className="bg-purple-800 hover:bg-purple-900 text-white px-4 my-4 py-2 rounded-lg">
                {t("addMoreImageUrls")}                </button>
                {productInputs.length > 1 && (
                  <button
                    type="button"
                    className="text-white bg-red-700 hover:bg-red-900 ml-6 px-4 my-4 py-2 rounded-lg"
                    onClick={() => removeProducts(index)}
                  >
                    {t("deleteproduct")}
                  </button>
                )}
              </div>

            ))}
            <button type="button" onClick={addMoreProduct} className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded-lg">
            {t("addMoreProducts")}    
            </button>

          </div>
        )}

        <button type="submit" className="w-full bg-primary text-white p-3 bg-purple-950 hover:bg-purple-800 rounded-lg">{t("submit")}</button>
      </form>
    </div>
  );
}

export default Add;