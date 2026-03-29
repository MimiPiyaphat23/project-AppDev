import { useState, useEffect, useRef } from 'react'
import { MapPin, Pencil, Trash2 } from 'lucide-react'
import { useStores } from '../../context/StoreContext'
import { storeAPI, categoryAPI, mallAPI, floorAPI } from '../../services/api'

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

    // Categories, Malls, Floors state
    const [categories, setCategories] = useState([])
    const [malls, setMalls] = useState([])
    const [floorsByFloorCode, setFloorsByFloorCode] = useState({})

    useEffect(() => {
        // Fetch stores
        storeAPI.getAll()
            .then(res => {
                const data = res.data.data || []
                const formatted = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    floor: item.floor,
                    floor_id: item.floor_id,
                    category: item.category?.name,
                    icon: item.category?.icon || '🏪',
                    logo: item.logo,
                    description: item.description,
                    position: item.position,
                    phone: item.phone,
                    opening_hours: item.opening_hours,
                    store_category_id: item.store_category_id,
                    mall_id: item.mall_id
                }))
                setStores(formatted)
                localStorage.setItem('mall_stores', JSON.stringify(formatted))
            })
            .catch(err => console.error('Failed to load stores:', err))

        // Fetch categories
        categoryAPI.getAll()
            .then(res => {
                const cats = res.data.data || []
                setCategories(cats)
            })
            .catch(err => console.error('Failed to load categories:', err))

        // Fetch malls
        mallAPI.getAll()
            .then(res => {
                const mallData = res.data.data || []
                setMalls(mallData)
            })
            .catch(err => console.error('Failed to load malls:', err))

        // Fetch all floors
        floorAPI.getAll()
            .then(res => {
                const floorData = res.data.data || []
                console.log('Floor API Response:', floorData)
                // Create a map of floor codes to floor data
                const floorMap = {}
                floorData.forEach(floor => {
                    // Try different possible keys for floor code
                    const code = floor.floor_code || floor.FloorCode || floor.floorCode
                    if (code) {
                        floorMap[code] = floor
                    }
                })
                console.log('Floor Map:', floorMap)
                setFloorsByFloorCode(floorMap)
            })
            .catch(err => console.error('Failed to load floors:', err))
    }, [])
    const [currentFloor, setCurrentFloor] = useState('LG')
    const [deleteId, setDeleteId] = useState(null)
    const [editStore, setEditStore] = useState(null)
    const [zoom, setZoom] = useState(1.5)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [showAddStore, setShowAddStore] = useState(false)
    const [newStore, setNewStore] = useState({
        name: '', category: '', floor: 'G', description: '', logo: null,
        email: '', password: '', confirmPassword: ''
    })
    const [drawingMode, setDrawingMode] = useState(false)
    const [currentPoints, setCurrentPoints] = useState([])
    const [pendingArea, setPendingArea] = useState(null)
    const [assignStore, setAssignStore] = useState('')

    const mapRef = useRef(null)
    const isPanningRef = useRef(false)
    const panStartRef = useRef({ x: 0, y: 0 })
    const panRef = useRef({ x: 0, y: 0 })
    const zoomRef = useRef(1.5)
    const panStateRef = useRef({ x: 0, y: 0 })

    const currentFloorData = floors.find((f) => f.id === currentFloor)
    const storesOnFloor = stores.filter((s) => s.floor === currentFloor)
    const uniqueCategories = [...new Set(stores.map((s) => s.category))].length

    const strokes = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']
    const colors = ['rgba(99,102,241,0.15)', 'rgba(16,185,129,0.15)', 'rgba(245,158,11,0.15)', 'rgba(239,68,68,0.15)', 'rgba(59,130,246,0.15)']

    // ✅ sync ref ทันทีตอน zoom เปลี่ยน (ไม่รอ useEffect)
    const setZoomSync = (updater) => {
        setZoom(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater
            zoomRef.current = next
            return next
        })
    }

    const setPanSync = (newPan) => {
        panStateRef.current = newPan
        setPan(newPan)
    }

    useEffect(() => { zoomRef.current = zoom }, [zoom])
    useEffect(() => { panStateRef.current = pan }, [pan])

    useEffect(() => {
        localStorage.setItem('mall_areas', JSON.stringify(areas))
    }, [areas])

    useEffect(() => {
        const el = mapRef.current
        if (!el) return

        const wheelHandler = (e) => {
            e.preventDefault()
            requestAnimationFrame(() => {
                setZoom(z => {
                    const delta = e.deltaY > 0 ? -0.08 : 0.08
                    const newZ = Math.min(Math.max(z + delta, 0.5), 3)
                    zoomRef.current = newZ
                    return newZ
                })
            })
        }

        const mouseDownHandler = (e) => {
            if (e.button === 1) {
                e.preventDefault()
                isPanningRef.current = true
                panStartRef.current = {
                    x: e.clientX - panRef.current.x,
                    y: e.clientY - panRef.current.y
                }
                setIsPanning(true)
            }
        }

        const mouseMoveHandler = (e) => {
            if (!isPanningRef.current) return
            const newPan = {
                x: e.clientX - panStartRef.current.x,
                y: e.clientY - panStartRef.current.y
            }
            panRef.current = newPan
            panStateRef.current = newPan
            setPan({ ...newPan })
        }

        const mouseUpHandler = () => {
            isPanningRef.current = false
            setIsPanning(false)
        }

        el.addEventListener('wheel', wheelHandler, { passive: false })
        el.addEventListener('mousedown', mouseDownHandler)
        el.addEventListener('mousemove', mouseMoveHandler)
        el.addEventListener('mouseup', mouseUpHandler)
        el.addEventListener('mouseleave', mouseUpHandler)

        return () => {
            el.removeEventListener('wheel', wheelHandler)
            el.removeEventListener('mousedown', mouseDownHandler)
            el.removeEventListener('mousemove', mouseMoveHandler)
            el.removeEventListener('mouseup', mouseUpHandler)
            el.removeEventListener('mouseleave', mouseUpHandler)
        }
    }, [])

    const handleDelete = () => {
        storeAPI.delete(deleteId)
            .then(() => {
                setStores(stores.filter((s) => s.id !== deleteId))
                setDeleteId(null)
            })
            .catch(err => {
                console.error('Delete error:', err)
                alert('Failed to delete store')
            })
    }

    const getCentroid = (points) => ({
        x: points.reduce((s, p) => s + p.x, 0) / points.length,
        y: points.reduce((s, p) => s + p.y, 0) / points.length,
    })

    // ✅ ใช้ ref แทน state เพื่อกัน stale closure ตอน draw area
    const toScreenPos = (xPct, yPct) => {
        const el = mapRef.current
        if (!el) return { x: 0, y: 0 }
        const containerW = el.offsetWidth
        const containerH = el.offsetHeight
        const imgCenterX = containerW / 2
        const imgCenterY = containerH / 2
        const rawX = (xPct / 100) * containerW
        const rawY = (yPct / 100) * containerH
        const z = zoomRef.current
        const p = panStateRef.current
        return {
            x: imgCenterX + (rawX - imgCenterX) * z + p.x,
            y: imgCenterY + (rawY - imgCenterY) * z + p.y,
        }
    }

    const toImagePct = (clickX, clickY) => {
        const el = mapRef.current
        if (!el) return { x: 0, y: 0 }
        const containerW = el.offsetWidth
        const containerH = el.offsetHeight
        const imgCenterX = containerW / 2
        const imgCenterY = containerH / 2
        const z = zoomRef.current
        const p = panStateRef.current
        const realX = (clickX - p.x - imgCenterX) / z + imgCenterX
        const realY = (clickY - p.y - imgCenterY) / z + imgCenterY
        return {
            x: (realX / containerW) * 100,
            y: (realY / containerH) * 100,
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800">Central Smart Mall</h1>
            <h2 className="text-lg font-semibold text-gray-700">Map Editor Dashboard</h2>
            <p className="text-gray-400 text-sm mb-6">Manage mall directory and store locations</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Total Stores</p>
                        <MapPin className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stores.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Across all floors</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Current Floor</p>
                        <MapPin className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{storesOnFloor.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Stores on {currentFloor} Floor</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Categories</p>
                        <MapPin className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{uniqueCategories}</p>
                    <p className="text-xs text-gray-400 mt-1">Unique categories</p>
                </div>
            </div>

            {/* Mall Map */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="font-semibold text-gray-700">Mall Map</p>
                        <p className="text-xs text-gray-400">Draw area then assign a store to it</p>
                    </div>
                    <div className="flex gap-2">
                        {drawingMode ? (
                            <>
                                <button
                                    onClick={() => {
                                        if (currentPoints.length >= 3) {
                                            setPendingArea(currentPoints)
                                            setCurrentPoints([])
                                            setDrawingMode(false)
                                        }
                                    }}
                                    disabled={currentPoints.length < 3}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${currentPoints.length >= 3
                                            ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        }`}
                                >
                                    ✓ Confirm Area ({currentPoints.length} pts)
                                </button>
                                <button
                                    onClick={() => { setDrawingMode(false); setCurrentPoints([]) }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                >
                                    ✕ Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setDrawingMode(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                >
                                    ⬜ Draw Area
                                </button>
                                <button
                                    onClick={() => setShowAddStore(true)}
                                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                    + Add Store
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Floor Tabs */}
                <div className="flex gap-2 mb-4">
                    {floors.map((floor) => {
                        const count = stores.filter((s) => s.floor === floor.id).length
                        return (
                            <button
                                key={floor.id}
                                onClick={() => {
                                    setCurrentFloor(floor.id)
                                    setPanSync({ x: 0, y: 0 })
                                    panRef.current = { x: 0, y: 0 }
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${currentFloor === floor.id
                                        ? 'bg-gray-700 text-white border-gray-700'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {floor.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${currentFloor === floor.id ? 'bg-white text-gray-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Map Container */}
                <div
                    ref={mapRef}
                    className={`map-container relative bg-gray-50 rounded-lg overflow-hidden h-80 border border-gray-100 ${drawingMode ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-default'
                        }`}
                    onClick={(e) => {
                        if (!drawingMode) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        const pos = toImagePct(e.clientX - rect.left, e.clientY - rect.top)
                        // ✅ functional update กัน stale closure ของ currentPoints
                        setCurrentPoints(prev => [...prev, pos])
                    }}
                >
                    <div className="absolute top-3 left-3 bg-white text-xs text-gray-500 px-2 py-1 rounded shadow-sm z-10">
                        {Math.round(zoom * 100)}%
                    </div>

                    {drawingMode && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-yellow-50 border border-yellow-300 text-yellow-700 text-xs px-4 py-1.5 rounded-full shadow-sm z-10">
                            คลิกเพื่อเพิ่มจุด ({currentPoints.length} จุด) • ต้องการอย่างน้อย 3 จุด
                        </div>
                    )}

                    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                        <button onClick={(e) => { e.stopPropagation(); setZoomSync(z => Math.min(z + 0.25, 3)) }}
                            className="bg-white shadow rounded p-1 hover:bg-gray-50 w-8 h-8 flex items-center justify-center text-gray-600">+</button>
                        <button onClick={(e) => { e.stopPropagation(); setZoomSync(z => Math.max(z - 0.25, 0.5)) }}
                            className="bg-white shadow rounded p-1 hover:bg-gray-50 w-8 h-8 flex items-center justify-center text-gray-600">−</button>
                    </div>

                    <img
                        src={currentFloorData.image}
                        alt={`Floor ${currentFloor}`}
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transition: isPanning ? 'none' : 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            willChange: 'transform',
                            transformOrigin: 'center center',
                        }}
                        className="w-full h-full object-contain"
                        draggable={false}
                    />

                    <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                        {areas.filter((a) => a.floor === currentFloor).map((area, i) => {
                            const pts = area.points.map(p => {
                                const s = toScreenPos(p.x, p.y)
                                return `${s.x},${s.y}`
                            }).join(' ')
                            return (
                                <g key={i}>
                                    <polygon points={pts} fill={colors[i % colors.length]} stroke={strokes[i % strokes.length]} strokeWidth="1.5" strokeDasharray="4 2" />
                                </g>
                            )
                        })}

                        {currentPoints.length > 0 && (
                            <>
                                {currentPoints.length >= 2 && (
                                    <polygon
                                        points={currentPoints.map(p => { const s = toScreenPos(p.x, p.y); return `${s.x},${s.y}` }).join(' ')}
                                        fill="rgba(201,168,76,0.1)" stroke="#c9a84c" strokeWidth="1.5" strokeDasharray="4 2"
                                    />
                                )}
                                {currentPoints.map((p, idx) => {
                                    const s = toScreenPos(p.x, p.y)
                                    return <circle key={idx} cx={s.x} cy={s.y} r="5" fill="#c9a84c" stroke="white" strokeWidth="2" />
                                })}
                            </>
                        )}
                    </svg>

                    {areas.filter((a) => a.floor === currentFloor).map((area, i) => {
                        const centroid = getCentroid(area.points)
                        const screenPos = toScreenPos(centroid.x, centroid.y)
                        const store = stores.find(s => s.name === area.storeName)
                        return (
                            <div key={i} className="absolute z-20 pointer-events-none"
                                style={{ left: screenPos.x, top: screenPos.y, transform: 'translate(-50%, -100%)' }}>
                                <div className="flex flex-col items-center">
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        border: `3px solid ${strokes[i % strokes.length]}`,
                                        background: 'white', overflow: 'hidden',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                                    }}>
                                        {store?.logo ? <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={store?.name} /> : store?.icon || '🏪'}
                                    </div>
                                    <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `8px solid ${strokes[i % strokes.length]}` }} />
                                </div>
                            </div>
                        )
                    })}
                </div>

                <p className="text-xs text-gray-400 text-center mt-2">
                    💡 Scroll to zoom • Middle click to pan • Draw area to mark store locations
                </p>
            </div>

            {/* Store Directory */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-4">
                    <p className="font-semibold text-gray-700">Store Directory</p>
                    <p className="text-xs text-gray-400">All stores in the mall</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {stores.map((store) => (
                        <div key={store.id} className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl overflow-hidden">
                                    {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" /> : store.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{store.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{store.category}</span>
                                        <span className="text-xs text-gray-400">Floor {store.floor}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditStore({ ...store })}
                                    className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleteId(store.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Store Modal */}
            {showAddStore && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Add New Store</h3>
                                <p className="text-sm text-gray-400">Store will appear in the directory</p>
                            </div>
                            <button onClick={() => setShowAddStore(false)} className="text-gray-400 hover:text-gray-700">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
                                <input type="text" placeholder="e.g., Nike Store" value={newStore.name}
                                    onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] focus:border-[#ECDEAB]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select value={newStore.category} onChange={(e) => setNewStore({ ...newStore, category: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] text-gray-500">
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Floor *</label>
                                <select value={newStore.floor} onChange={(e) => setNewStore({ ...newStore, floor: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] text-gray-700">
                                    <option value="LG">LG Floor</option>
                                    <option value="G">Ground Floor</option>
                                    <option value="1">Floor 1</option>
                                    <option value="2">Floor 2</option>
                                    <option value="3">Floor 3</option>
                                    <option value="4">Floor 4</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea placeholder="Brief description of the store..." value={newStore.description}
                                    onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
                                    rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo (Optional)</label>
                                <input type="file" accept="image/*"
                                    onChange={(e) => { const file = e.target.files[0]; if (file) setNewStore({ ...newStore, logo: URL.createObjectURL(file) }) }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input type="email" placeholder="store@example.com" value={newStore.email}
                                    onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] focus:border-[#ECDEAB]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input type="password" placeholder="••••••••" value={newStore.password}
                                    onChange={(e) => setNewStore({ ...newStore, password: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] focus:border-[#ECDEAB]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                                <input type="password" placeholder="••••••••" value={newStore.confirmPassword}
                                    onChange={(e) => setNewStore({ ...newStore, confirmPassword: e.target.value })}
                                    className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] ${newStore.confirmPassword && newStore.password !== newStore.confirmPassword
                                            ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-[#ECDEAB]'
                                        }`} />
                                {newStore.confirmPassword && newStore.password !== newStore.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddStore(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                            <button
                                onClick={() => {
                                    if (!newStore.name || !newStore.category || !newStore.email || !newStore.password) return
                                    if (newStore.password !== newStore.confirmPassword) return

                                    // Get category ID from categories
                                    const categoryObj = categories.find(c => c.name === newStore.category)
                                    const categoryId = categoryObj?.id

                                    if (!categoryId) {
                                        alert('Please select a valid category')
                                        return
                                    }

                                    // Get floor ID - try multiple methods
                                    let floorId = null

                                    // Method 1: From fetched floor data
                                    let floorData = floorsByFloorCode[newStore.floor]
                                    floorId = floorData?.floor_id || floorData?.FloorID

                                    // Method 2: From existing stores on this floor (fallback)
                                    if (!floorId) {
                                        const storeOnFloor = stores.find(s => s.floor === newStore.floor)
                                        floorId = storeOnFloor?.floor_id
                                    }

                                    // Method 3: Hardcoded floor mapping as ultimate fallback
                                    // Maps floor codes to typical IDs (typically Floor 1-5 have IDs 1-5)
                                    if (!floorId) {
                                        const floorCodeToId = {
                                            'LG': 1,  // Lower Ground
                                            'G': 2,   // Ground
                                            '1': 3,   // Floor 1
                                            '2': 4,   // Floor 2
                                            '3': 5,   // Floor 3
                                            '4': 6    // Floor 4
                                        }
                                        floorId = floorCodeToId[newStore.floor]
                                    }

                                    console.log('Looking for floor:', newStore.floor, 'Found ID:', floorId, 'Available floors:', Object.keys(floorsByFloorCode), 'Stores count:', stores.length)

                                    if (!floorId) {
                                        alert(`Floor ID not found for floor: ${newStore.floor}`)
                                        return
                                    }

                                    // Get mall ID - use first mall if no stores exist yet
                                    const firstStore = stores[0]
                                    const mallId = firstStore?.mall_id || (malls[0]?.mall_id) || 1

                                    // ✅ Optimistic update - add ทันที ไม่รอ backend
                                    const tempId = Date.now()
                                    const optimisticStore = {
                                        id: tempId,
                                        name: newStore.name,
                                        floor: newStore.floor,
                                        floor_id: floorId,
                                        category: newStore.category,
                                        icon: '🏪',
                                        logo: newStore.logo ?? null,
                                        description: newStore.description ?? '',
                                        position: { x: 0, y: 0 },
                                        mail_id: mallId,
                                        store_category_id: categoryId
                                    }
                                    setStores(prev => [...prev, optimisticStore])
                                    setNewStore({ name: '', category: '', floor: 'G', description: '', logo: null, email: '', password: '', confirmPassword: '' })
                                    setShowAddStore(false)

                                    // sync กับ backend แล้วแทนที่ด้วย id จริง
                                    storeAPI.create({
                                        StoreName: newStore.name,
                                        StoreCategoryName: newStore.category,
                                        StoreCategoryID: categoryId,
                                        Description: newStore.description || '',
                                        Phone: '',
                                        OpeningHours: '',
                                        LogoURL: newStore.logo || '',
                                        MallID: mallId,
                                        FloorID: floorId,
                                        PosX: 0,
                                        PosY: 0
                                    })
                                        .then(res => {
                                            const item = res.data.data || { id: res.data.id }
                                            setStores(prev => prev.map(s => s.id === tempId ? {
                                                id: item.id ?? tempId,
                                                name: item.name ?? optimisticStore.name,
                                                floor: item.floor ?? optimisticStore.floor,
                                                floor_id: item.floor_id ?? floorId,
                                                category: item.category?.name ?? item.category ?? optimisticStore.category,
                                                icon: item.category?.icon ?? categoryObj?.icon ?? '🏪',
                                                logo: item.logo ?? optimisticStore.logo,
                                                description: item.description ?? optimisticStore.description,
                                                position: item.position ?? { x: 0, y: 0 },
                                                store_category_id: item.store_category_id ?? categoryId,
                                                mail_id: item.mall_id ?? mallId,
                                                phone: item.phone || '',
                                                opening_hours: item.opening_hours || ''
                                            } : s))
                                        })
                                        .catch(err => {
                                            // Remove optimistic store if request failed
                                            setStores(prev => prev.filter(s => s.id !== tempId))
                                            console.error('Add store error:', err)
                                            alert('Failed to add store: ' + (err.response?.data?.message || err.message))
                                        })
                                }}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg font-medium"
                            >
                                Add Store
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Store Modal */}
            {editStore && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Edit Store</h3>
                                <p className="text-sm text-gray-400">Update store information</p>
                            </div>
                            <button onClick={() => setEditStore(null)} className="text-gray-400 hover:text-gray-700">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
                                <input type="text" value={editStore.name}
                                    onChange={(e) => setEditStore({ ...editStore, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] focus:border-[#ECDEAB]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select value={editStore.category}
                                    onChange={(e) => setEditStore({ ...editStore, category: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]">
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Floor *</label>
                                <select value={editStore.floor}
                                    onChange={(e) => setEditStore({ ...editStore, floor: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]">
                                    <option value="LG">LG Floor</option>
                                    <option value="G">Ground Floor</option>
                                    <option value="1">Floor 1</option>
                                    <option value="2">Floor 2</option>
                                    <option value="3">Floor 3</option>
                                    <option value="4">Floor 4</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={editStore.description || ''}
                                    onChange={(e) => setEditStore({ ...editStore, description: e.target.value })}
                                    rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo</label>
                                {editStore.logo && (
                                    <img src={editStore.logo} alt="logo" className="w-12 h-12 rounded-full object-cover mb-2" />
                                )}
                                <input type="file" accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) setEditStore({ ...editStore, logo: URL.createObjectURL(file) })
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                                <p className="text-xs text-gray-400 mt-1">Upload a store logo (optional)</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={() => { setDeleteId(editStore.id); setEditStore(null) }}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm rounded-lg font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Store
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => setEditStore(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                                <button
                                    onClick={() => {
                                        if (!editStore.name || !editStore.category) return

                                        // Get category ID from categories
                                        const categoryObj = categories.find(c => c.name === editStore.category)
                                        const categoryId = categoryObj?.id || editStore.store_category_id

                                        storeAPI.update(editStore.id, {
                                            StoreName: editStore.name,
                                            StoreCategoryName: editStore.category,
                                            StoreCategoryID: categoryId,
                                            Description: editStore.description || '',
                                            Phone: editStore.phone || '',
                                            OpeningHours: editStore.opening_hours || '',
                                            LogoURL: editStore.logo || '',
                                            FloorID: editStore.floor_id,
                                            PosX: editStore.position?.x || 0,
                                            PosY: editStore.position?.y || 0
                                        })
                                            .then(() => {
                                                // After successful update, fetch the updated store
                                                return storeAPI.getById(editStore.id)
                                            })
                                            .then(res => {
                                                const updated = res.data.data
                                                const formattedStore = {
                                                    id: updated.id,
                                                    name: updated.name,
                                                    floor: updated.floor,
                                                    floor_id: updated.floor_id,
                                                    category: updated.category?.name,
                                                    icon: updated.category?.icon || '🏪',
                                                    logo: updated.logo,
                                                    description: updated.description,
                                                    position: updated.position,
                                                    store_category_id: updated.store_category_id,
                                                    phone: updated.phone,
                                                    opening_hours: updated.opening_hours,
                                                    mall_id: updated.mall_id
                                                }
                                                setStores(stores.map(s => s.id === editStore.id ? formattedStore : s))
                                                setEditStore(null)
                                            })
                                            .catch(err => {
                                                console.error('Update error:', err)
                                                alert('Failed to update store: ' + (err.response?.data?.message || err.message))
                                            })
                                    }}
                                    className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Store Modal */}
            {pendingArea && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Assign Store to Area</h3>
                        <p className="text-sm text-gray-400 mb-6">เลือกร้านค้าที่ต้องการผูกกับพื้นที่นี้</p>
                        <select value={assignStore} onChange={(e) => setAssignStore(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] mb-6">
                            <option value="">Select a store...</option>
                            {stores.map((s) => (
                                <option key={s.id} value={s.name}>{s.name} — Floor {s.floor}</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setPendingArea(null); setAssignStore('') }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                            <button
                                onClick={() => {
                                    if (!assignStore) return
                                    setAreas([...areas, { points: pendingArea, storeName: assignStore, floor: currentFloor }])
                                    setPendingArea(null)
                                    setAssignStore('')
                                }}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg font-medium"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Store</h3>
                        <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete this store? This action cannot be undone.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleDelete} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg font-medium">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}