import React from 'react'
import Header from './Header'

function Dashboard() {
  return (
    <div>
      
<div className={`flex flex-col flex-grow transition-all duration-300 ${isSidebarOpen ? "lg:ml-[16rem]" : ""}`}>
        {/* Header with Sidebar Toggle Button */}
        <div className="bg-white p-5 shadow flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-700 focus:outline-none"
          >
            <FaBars size={24} />
          </button>

          <h2 className="text-xl font-bold">Admin Dashboard</h2>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">{admin?.name || "Loading..."}</span>
            <span className="text-gray-700 font-medium">{admin?.id || "Loading..."}</span>

           
          </div>
        </div>
        {/* Dashboard Cards */}
        <div className="flex justify-center">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            <motion.div
              className="bg-white p-6 justify-center shadow rounded-xl lg:w-[300px] lg:h-[250px] flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <FaProjectDiagram className="text-6xl text-blue-500" />
              <h3 className="text-2xl font-semibold mt-2">Products</h3>
              <p className="text-gray-600 text-5xl font-semibold mt-4">{products.length}</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 justify-center shadow rounded-xl flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <FaTasks className="text-6xl text-green-500" />
              <h3 className="text-2xl font-semibold mt-2">Categories</h3>
              <p className="text-gray-600 text-5xl font-semibold mt-4">{categories.length}</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 shadow rounded-xl justify-center flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <FaUsers className="text-6xl text-yellow-500" />
              <h3 className="text-2xl font-semibold mt-2">Sub Categories</h3>
              <p className="text-gray-600 text-5xl font-semibold mt-4">{subCategories.length}</p>
            </motion.div>
          </div>
        </div>

        {/* Product List Section */}
        <div>
        <div>All product List</div>
      </div>
        <List />
      </div>
    </div>
  )
}

export default Dashboard