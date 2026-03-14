// ทำให้ทุกหน้ารู้ว่าตอนนี้อยู่ห้างไหน ชั้นไหน
import { createContext, useContext, useState } from 'react'

const MallContext = createContext(null)

export function MallProvider({ children }) {
  const [selectedMall, setSelectedMall] = useState(null)    // ห้างที่เลือก
  const [selectedFloor, setSelectedFloor] = useState(null)  // ชั้นที่เลือก

  return (
    <MallContext.Provider value={{ selectedMall, setSelectedMall, selectedFloor, setSelectedFloor }}>
      {children}
    </MallContext.Provider>
  )
}

export const useMall = () => useContext(MallContext)