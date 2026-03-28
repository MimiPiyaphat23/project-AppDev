import { useState, useEffect, useRef } from 'react'
import { MapPin, Pencil, Trash2 } from 'lucide-react'
import { useStores } from '../../context/StoreContext'

const floors = [
    { id: 'LG', label: 'LG', image: '/picture/LG.png' },
    { id: 'G', label: 'G', image: '/picture/G.png' },
    { id: '1', label: '1', image: '/picture/1.png' },
    { id: '2', label: '2', image: '/picture/2.png' },
    { id: '3', label: '3', image: '/picture/3.png' },
    { id: '4', label: '4', image: '/picture/4.png' },
]

export default function MapEditorDashboard() {
    const { stores, setStores, areas, setAreas } = useStores()
    const [currentFloor, setCurrentFloor] = useState('LG')
    const [zoom, setZoom] = useState(1.5)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)

    const mapRef = useRef(null)
    const panRef = useRef({ x: 0, y: 0 })

    const currentFloorData = floors.find((f) => f.id === currentFloor)

    const storesOnFloor = stores.filter((s) => s.floor === currentFloor)
    const categories = [...new Set(stores.map((s) => s.category))].length

    // ✅ FETCH DATA FROM BACKEND
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/stores')
                const data = await res.json()

                if (data.success) {
                    const formatted = data.data.map(item => ({
                        id: item.id,
                        name: item.name,
                        floor: item.floor,
                        category: item.category?.name,
                        icon: item.category?.icon || '🏪',
                        logo: item.logo,
                        description: item.description,
                        position: item.position
                    }))

                    setStores(formatted)
                }
            } catch (err) {
                console.error('Fetch error:', err)
            }
        }

        fetchStores()
    }, [])

    // zoom
    useEffect(() => {
        const el = mapRef.current
        if (!el) return

        const wheelHandler = (e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.08 : 0.08
            setZoom(z => Math.min(Math.max(z + delta, 0.5), 3))
        }

        el.addEventListener('wheel', wheelHandler, { passive: false })

        return () => el.removeEventListener('wheel', wheelHandler)
    }, [])

    // convert %
    const toScreenPos = (xPct, yPct) => {
        const el = mapRef.current
        if (!el) return { x: 0, y: 0 }

        const w = el.offsetWidth
        const h = el.offsetHeight

        return {
            x: (xPct / 100) * w * zoom + pan.x,
            y: (yPct / 100) * h * zoom + pan.y,
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Central Smart Mall</h1>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 my-6">
                <div className="bg-white p-4 rounded shadow">
                    <p>Total Stores</p>
                    <h2 className="text-2xl font-bold">{stores.length}</h2>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <p>Current Floor</p>
                    <h2 className="text-2xl font-bold">{storesOnFloor.length}</h2>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <p>Categories</p>
                    <h2 className="text-2xl font-bold">{categories}</h2>
                </div>
            </div>

            {/* Floor Tabs */}
            <div className="flex gap-2 mb-4">
                {floors.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setCurrentFloor(f.id)}
                        className={`px-4 py-2 rounded ${
                            currentFloor === f.id ? 'bg-black text-white' : 'bg-gray-200'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Map */}
            <div
                ref={mapRef}
                className="relative h-96 bg-gray-100 overflow-hidden"
            >
                <img
                    src={currentFloorData.image}
                    className="w-full h-full object-contain"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                    }}
                    draggable={false}
                />

                {/* ✅ แสดงร้านจาก backend */}
                {storesOnFloor.map(store => {
                    if (!store.position) return null

                    const pos = toScreenPos(store.position.x, store.position.y)

                    return (
                        <div
                            key={store.id}
                            style={{
                                position: 'absolute',
                                left: pos.x,
                                top: pos.y,
                                transform: 'translate(-50%, -100%)'
                            }}
                        >
                            <div className="bg-white px-2 py-1 rounded shadow text-xs">
                                {store.logo
                                    ? <img src={store.logo} className="w-6 h-6" />
                                    : store.icon
                                }
                                <p>{store.name}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Store List */}
            <div className="mt-6 bg-white p-4 rounded shadow">
                {stores.map(store => (
                    <div key={store.id} className="flex justify-between py-2">
                        <div>
                            <p>{store.name}</p>
                            <small>{store.category} • Floor {store.floor}</small>
                        </div>
                        <div className="flex gap-2">
                            <Pencil size={16} />
                            <Trash2 size={16} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}