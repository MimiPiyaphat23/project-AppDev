import React, { createContext, useContext, useEffect, useState } from 'react'
import { storeAPI } from '../services/api'

const StoreContext = createContext()

const normalizeStore = (item) => ({
  id: item.id,
  name: item.name,
  category: item.category?.name || item.category_name || '-',
  floor: item.floor,
  floor_id: item.floor_id,
  icon: item.category?.icon || '🏬',
  logo: item.logo,
  phone: item.phone,
  posX: item.position?.x ?? 0,
  posY: item.position?.y ?? 0,
  description: item.description,
  openingHours: item.opening_hours,
  price: item.price,
  stock: item.stock,
  status: item.status,
  position: item.position,
  store_category_id: item.store_category_id,
  mall_id: item.mall_id,
})

export const StoreProvider = ({ children }) => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)

  // ✅ โหลด areas จาก localStorage ตอน init
  const [areas, setAreas] = useState(() => {
    try {
      const saved = localStorage.getItem('mall_areas')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  // ✅ save areas ลง localStorage ทุกครั้งที่เปลี่ยน
  const setAreasWithSave = (newAreas) => {
    const value = typeof newAreas === 'function' ? newAreas(areas) : newAreas
    localStorage.setItem('mall_areas', JSON.stringify(value))
    setAreas(value)
  }

  const fetchStores = async () => {
    setLoading(true)
    try {
      const response = await storeAPI.getAll()
      if (response.data.success) {
        setStores((response.data.data || []).map(normalizeStore))
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  return (
    <StoreContext.Provider value={{ stores, setStores, areas, setAreas: setAreasWithSave, loading, refreshStores: fetchStores }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStores = () => useContext(StoreContext)