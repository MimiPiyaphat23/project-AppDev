import { useMemo, useState } from 'react'
import { MapPin, Pencil, Trash2 } from 'lucide-react'
import { useStores } from '../../context/StoreContext'
import { storeAPI } from '../../services/api'

const floors = ['LG', 'G', '1', '2', '3', '4']

export default function MapEditorDashboard() {
  const { stores, setStores, refreshStores } = useStores()
  const [currentFloor, setCurrentFloor] = useState('G')
  const [editingStore, setEditingStore] = useState(null)
  const [saving, setSaving] = useState(false)

  const storesOnFloor = useMemo(
    () => stores.filter((store) => String(store.floor) === String(currentFloor)),
    [stores, currentFloor]
  )

  const categories = new Set(stores.map((store) => store.category).filter(Boolean)).size

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this store?')) return
    try {
      await storeAPI.delete(id)
      setStores(stores.filter((store) => store.id !== id))
    } catch (error) {
      alert(error?.response?.data?.message || 'Delete failed')
    }
  }

  const openEditor = (store) => {
    setEditingStore({
      id: store.id,
      StoreName: store.name,
      StoreCategoryName: store.category,
      StoreCategoryID: 1,
      StoreCategoryIcon: store.icon || '🏬',
      Description: store.description || '',
      Phone: store.phone || '',
      OpeningHours: store.openingHours || '',
      LogoURL: store.logo || '',
      FloorID: store.floor_id || 1,
      FloorName: store.floor,
      PosX: store.posX || 0,
      PosY: store.posY || 0,
    })
  }

  const handleSave = async () => {
    if (!editingStore?.StoreName) return
    try {
      setSaving(true)
      await storeAPI.update(editingStore.id, editingStore)
      await refreshStores()
      setEditingStore(null)
    } catch (error) {
      alert(error?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Map Editor Dashboard</h1>
        <p className="text-sm text-gray-400">Connected to backend store data</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Total Stores</p>
            <MapPin className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stores.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Current Floor</p>
            <MapPin className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{storesOnFloor.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Categories</p>
            <MapPin className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{categories}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-2 mb-4">
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setCurrentFloor(floor)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${currentFloor === floor ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {floor}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Store</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Floor</th>
                <th className="pb-3 font-medium">Position</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {storesOnFloor.map((store) => (
                <tr key={store.id} className="border-b border-gray-50">
                  <td className="py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center text-lg">
                      {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" /> : store.icon || '🏬'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{store.name}</div>
                      <div className="text-xs text-gray-400">{store.description || 'No description'}</div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-700">{store.category || '-'}</td>
                  <td className="py-3 text-gray-700">{store.floor || '-'}</td>
                  <td className="py-3 text-gray-700">{store.posX ?? 0}, {store.posY ?? 0}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditor(store)} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(store.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingStore && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Edit Store</h3>
              <button onClick={() => setEditingStore(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <input value={editingStore.StoreName} onChange={(e) => setEditingStore({ ...editingStore, StoreName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" placeholder="Store name" />
            <input value={editingStore.StoreCategoryName} onChange={(e) => setEditingStore({ ...editingStore, StoreCategoryName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" placeholder="Category" />
            <textarea value={editingStore.Description} onChange={(e) => setEditingStore({ ...editingStore, Description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" rows={3} placeholder="Description" />
            <div className="grid grid-cols-2 gap-3">
              <input value={editingStore.PosX} onChange={(e) => setEditingStore({ ...editingStore, PosX: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" type="number" placeholder="PosX" />
              <input value={editingStore.PosY} onChange={(e) => setEditingStore({ ...editingStore, PosY: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" type="number" placeholder="PosY" />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingStore(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg font-medium disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
