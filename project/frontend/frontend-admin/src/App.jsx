import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RoleSelection from './pages/RoleSelection'
import SellerLogin from './pages/SellerLogin'
import MapEditorLogin from './pages/MapEditorLogin'
import SellerLayout from './pages/seller/SellerLayout'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerProducts from './pages/seller/SellerProducts'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/map-editor-login" element={<MapEditorLogin />} />
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}