import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RoleSelection from './pages/RoleSelection'
import SellerLogin from './pages/SellerLogin'
import MapEditorLogin from './pages/MapEditorLogin'
import SellerLayout from './pages/seller/SellerLayout'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerProducts from './pages/seller/SellerProducts'
import MapEditorLayout from './pages/mapeditor/MapEditorLayout'
import MapEditorDashboard from './pages/mapeditor/MapEditorDashboard'
import MapEditorMap from './pages/mapeditor/MapEditorMap'
import { StoreProvider } from './context/StoreContext'
import { ProductProvider } from './context/ProductContext'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                    <Route path="/" element={<RoleSelection />} />
                    <Route path="/seller-login" element={<SellerLogin />} />
                    <Route path="/map-editor-login" element={<MapEditorLogin />} />
                    <Route path="/seller" element={<ProductProvider><SellerLayout /></ProductProvider>}>
                        <Route index element={<Navigate to="/seller/dashboard" replace />} />
                        <Route path="dashboard" element={<SellerDashboard />} />
                        <Route path="products" element={<SellerProducts />} />
                    </Route>
                    <Route path="/mapeditor" element={<StoreProvider><MapEditorLayout /></StoreProvider>}>
                        <Route index element={<Navigate to="/mapeditor/dashboard" replace />} />
                        <Route path="dashboard" element={<MapEditorDashboard />} />
                        <Route path="map" element={<MapEditorMap />} />
                    </Route>
                </Routes>
        </BrowserRouter>
    )
}