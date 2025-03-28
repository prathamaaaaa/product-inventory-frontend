import { BrowserRouter as Router, Routes, Route ,Navigate } from "react-router-dom";

import List from "./component/List";
import Add from "./component/Add";
import Detail from "./component/Detail";
import Register from "./component/Register";
import Login from "./component/Login";
import AdminPanel from "./component/AdminPanel";
import AuthPage from "./component/AuthPage";
import Store from "./component/Store";
import CreateStore from "./component/CreateStore";
import StoreDetail from "./component/StoreDetail";

function App() {
  return (
    
      <Routes>
        {/* <Route path="/list" element={<List />} /> */}
        <Route path="/add" element={<Add />} />
        <Route path="/add/:id" element={<Add />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/createstore" element={<CreateStore />} />
        {/* <Route path="/store" element={<Store />} /> */}
        <Route path="/store/:id" element={<StoreDetail />} /> 
        <Route path="/list" element={<List />} /> 

        <Route path="/admin" element={<AdminPanel />}>
          <Route index element={<Navigate to="/admin/dashboard" />} />  {/* Default to Dashboard */}
          <Route path="dashboard" element={<List />} />   {/* Dashboard will show List */}
          <Route path="store" element={<Store />} />      {/* Clicking Store will show Store */}
        </Route>

        <Route path="/admin/adminpanel" element={<AdminPanel />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/admin/detail/:id" element={<Detail />} />
        </Routes>
    
  );
}

export default App;