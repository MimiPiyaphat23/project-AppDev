import React, { createContext, useContext, useEffect, useState } from 'react'
import { storeAPI } from '../services/api'

const StoreContext = createContext()

const normalizeStore = (item) => ({
  id: item.id,
  name: item.name,
  category: item.category?.name || item.category_name || '-',
  floor: item.floor,
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
})

export const StoreProvider = ({ children }) => {
  const [stores, setStores] = useState([])
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(false)

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
    <StoreContext.Provider value={{ stores, setStores, areas, setAreas, loading, refreshStores: fetchStores }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStores = () => useContext(StoreContext)
