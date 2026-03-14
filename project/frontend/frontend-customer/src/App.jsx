// ============================================================
// src/App.jsx
// จุดรวม Provider และ Routes ทั้งหมด
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MallProvider } from './context/MallContext';
import MapPage           from './pages/MapPage';
import StoresPage        from './pages/StoresPage';
import FavoritesPage     from './pages/FavoritesPage';
import MallsPage         from './pages/MallsPage';
import ProfilePage       from './pages/ProfilePage';
import StoreDetailPage   from './pages/StoreDetailPage';    // popup ข้อมูลร้าน
import StoreProductsPage from './pages/StoreProductsPage';  // รายการสินค้า + stock
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <MallProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"                        element={<MapPage />}           />
            <Route path="/stores"                  element={<StoresPage />}        />
            <Route path="/favorites"               element={<FavoritesPage />}     />
            <Route path="/malls"                   element={<MallsPage />}         />
            <Route path="/profile"                 element={<ProfilePage />}       />
            {/* กดไอคอนร้านบนแผนที่ → popup รายละเอียดร้าน */}
            <Route path="/store/:storeId"          element={<StoreDetailPage />}   />
            {/* กด View Store → หน้าสินค้า + stock */}
            <Route path="/store/:storeId/products" element={<StoreProductsPage />} />
          </Routes>
        </BrowserRouter>
      </MallProvider>
    </AuthProvider>
  );
}