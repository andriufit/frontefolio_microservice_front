import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalog from './pages/Catalog'
import NewOrder from './pages/NewOrder'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Tracking from './pages/Tracking'
import Chat from './pages/Chat'
import Profile from './pages/Profile'

import Dashboard from './pages/staff/Dashboard'
import OrdersManagement from './pages/staff/OrdersManagement'
import CustomersList from './pages/staff/CustomersList'
import StaffList from './pages/staff/StaffList'
import SuppliersList from './pages/staff/SuppliersList'

const STAFF_ROLES = ['operator', 'manager', 'admin']
const MANAGER_ROLES = ['manager', 'admin']

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/catalog" element={<Catalog />} />

          {/* Customer */}
          <Route path="/orders/new" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Staff */}
          <Route path="/staff" element={<ProtectedRoute roles={STAFF_ROLES}><Dashboard /></ProtectedRoute>} />
          <Route path="/staff/orders" element={<ProtectedRoute roles={STAFF_ROLES}><OrdersManagement /></ProtectedRoute>} />
          <Route path="/staff/customers" element={<ProtectedRoute roles={STAFF_ROLES}><CustomersList /></ProtectedRoute>} />
          <Route path="/staff/suppliers" element={<ProtectedRoute roles={STAFF_ROLES}><SuppliersList /></ProtectedRoute>} />
          <Route path="/staff/team" element={<ProtectedRoute roles={MANAGER_ROLES}><StaffList /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
