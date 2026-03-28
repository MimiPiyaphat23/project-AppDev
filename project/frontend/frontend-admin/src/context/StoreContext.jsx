import React, { createContext, useContext, useState, useEffect } from 'react';
import { storeAPI } from '../services/api';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [stores, setStores] = useState([]);
  const [areas, setAreas] = useState([]); // เก็บไว้รองรับ Map Editor
  const [loading, setLoading] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await storeAPI.getAll();
      if (response.data.success) {
        const mappedData = response.data.data.map(item => ({
          id: item.StoreID,
          name: item.StoreName,
          category: item.StoreCategoryName,
          floor: item.FloorName,
          icon: item.StoreCategoryIcon || '🏬',
          logo: item.LogoURL,
          phone: item.Phone,
          posX: item.PosX,
          posY: item.PosY,
          description: item.Description,
          openingHours: item.OpeningHours
        }));
        setStores(mappedData);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <StoreContext.Provider value={{ stores, setStores, areas, setAreas, loading, refreshStores: fetchStores }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStores = () => useContext(StoreContext);