import React from 'react'
import { useEffect ,useState} from 'react'
function Filtering({t ,storeId, categories, subCategories,products, isAdminPanel, admin , onFilter}) {

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  // const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

 
  useEffect(() => {
    let filtered = products;

    if (storeId) {
      filtered = filtered.filter(product => product.storeId == storeId);
    }

    if (isAdminPanel && admin?.id) {
      filtered = filtered.filter(product => product.adminid == admin.id);
    }

    if (searchQuery) {
      const lang = localStorage.getItem("language") || "en";

      filtered = filtered.filter(product => {
        let nameInLang = "";

        if (typeof product.name === "object") {
          nameInLang = product.name[lang] || product.name["en"] || "";
        } else if (typeof product.name === "string") {
          try {
            const parsedName = JSON.parse(product.name);
            nameInLang = parsedName[lang] || parsedName["en"] || "";
          } catch (e) {
            nameInLang = product.name;
          }
        }

        return nameInLang.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryName === selectedCategory);
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(product => product.subCategoryName === selectedSubCategory);
    }

    setFilteredProducts(filtered);
    onFilter(filtered); 
  }, [searchQuery, selectedCategory, selectedSubCategory, products, storeId, isAdminPanel, admin]);

  useEffect(() => {
    if (selectedCategory) {
      const updatedSubCategories = subCategories.filter(
        (subCategory) => subCategory.categoryName === selectedCategory
      );

      setFilteredSubCategories(updatedSubCategories);
      const updatedProducts = products.filter((product) => product.categoryName === selectedCategory);
      setFilteredProducts(updatedProducts);
      setSelectedSubCategory("");
      onFilter(updatedProducts); 
    } else {
      setFilteredProducts(products);
      setFilteredSubCategories([]);
      onFilter(products); 
    }
  }, [selectedCategory, subCategories, products]);




  return (
    <div>

<div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-4">

<input
  type="text"
  placeholder={t('searchPlaceholder')}
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
  <option value=""> {t("allCategories")}</option>
  {categories
    .filter(category =>
      storeId ? parseInt(category.storeid) === parseInt(storeId) : true
    )
    .map((category) => (
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
  <option value="">{t("allSubcategories")}</option>
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
  {t("reset")}
</button>
</div>

    </div>
  )
}

export default Filtering;