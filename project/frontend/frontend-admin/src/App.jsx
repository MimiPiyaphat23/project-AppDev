import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RoleSelection from './pages/RoleSelection'
import SellerLogin from './pages/SellerLogin'
import MapEditorLogin from './pages/MapEditorLogin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/map-editor-login" element={<MapEditorLogin />} />
      </Routes>
    </BrowserRouter>
  )
}