import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement'
import InventoryManagement from './components/InventoryManagement'
import PlaceOrder from './components/order/PlaceOrder'
import Menu from './components/Menu'
import OrderHistoryViewer from "./components/order/OrderHistoryViewer"
import DailyRevenue from './components/DailyRevenue';
import TablesManager from './components/tablesManager';
import PasswordManagement from './components/RecoverPassword'
import ProfileUpdate from './components/ProfileUpdate';

export const apiUrl ="https://easyservebackend-production.up.railway.app"

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login theme={theme} setTheme={setTheme} />} />
        <Route path="/dashboard" element={<Dashboard theme={theme} setTheme={setTheme} />} />
        <Route path="/employee-management" element={<EmployeeManagement />} />
        <Route path="/inventory-management" element={<InventoryManagement />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/historial-pedidos" element={<OrderHistoryViewer />} />
        <Route path="/Hacer-caja" element={<DailyRevenue />} />
        <Route path="/table-management" element={<TablesManager />} />
        <Route path="/recover-password" element={<PasswordManagement />} />
        <Route path="/profileUpdate" element={<ProfileUpdate />} />
      </Routes>
    </Router>
  );
}

export default App;