import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { StoreProvider } from './context/StoreContext'
import MapEditorLogin from './pages/MapEditorLogin'
import RoleSelection from './pages/RoleSelection'
import SellerLogin from './pages/SellerLogin'
import MapEditorDashboard from './pages/mapeditor/MapEditorDashboard'
import MapEditorLayout from './pages/mapeditor/MapEditorLayout'
import MapEditorMap from './pages/mapeditor/MapEditorMap'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerLayout from './pages/seller/SellerLayout'
import SellerProducts from './pages/seller/SellerProducts'

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/seller-login" element={<SellerLogin />} />
          <Route path="/map-editor-login" element={<MapEditorLogin />} />

          <Route path="/seller" element={<ProtectedRoute allowedRoles={['StoreOwner']}><SellerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="products" element={<SellerProducts />} />
          </Route>

          <Route path="/mapeditor" element={<ProtectedRoute allowedRoles={['Admin']}><MapEditorLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/mapeditor/dashboard" replace />} />
            <Route path="dashboard" element={<MapEditorDashboard />} />
            <Route path="map" element={<MapEditorMap />} />
          </Route>
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  )
}
