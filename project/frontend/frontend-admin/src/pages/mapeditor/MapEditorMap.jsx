import { useState, useEffect, useRef } from 'react'
import { useStores } from '../../context/StoreContext'

const floors = [
    { id: 'LG', label: 'LG', image: '/picture/LG.png' },
    { id: 'G', label: 'G', image: '/picture/G.png' },
    { id: '1', label: '1', image: '/picture/1.png' },
    { id: '2', label: '2', image: '/picture/2.png' },
    { id: '3', label: '3', image: '/picture/3.png' },
    { id: '4', label: '4', image: '/picture/4.png' },
]

const strokes = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']
const colors = ['rgba(99,102,241,0.15)', 'rgba(16,185,129,0.15)', 'rgba(245,158,11,0.15)', 'rgba(239,68,68,0.15)', 'rgba(59,130,246,0.15)']

export default function MapEditorMap() {
    const { stores, setStores, areas } = useStores()

    const [currentFloor, setCurrentFloor] = useState('LG')
    const [zoom, setZoom] = useState(1.5)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [selectedStore, setSelectedStore] = useState(null)

    const mapRef = useRef(null)
    const isPanningRef = useRef(false)
    const panStartRef = useRef({ x: 0, y: 0 })
    const panRef = useRef({ x: 0, y: 0 })
    const zoomRef = useRef(1.5)
    const panStateRef = useRef({ x: 0, y: 0 })

    // ✅ fetch stores จาก backend ทุกครั้งที่เข้าหน้านี้
    useEffect(() => {
        fetch('http://localhost:5000/api/stores')
            .then(res => res.json())
            .then(data => {
                const list = data.data ?? data
                const formatted = list.map(item => ({
                    id: item.id,
                    name: item.name,
                    floor: item.floor,
                    category: item.category?.name ?? item.category,
                    icon: item.category?.icon || '🏪',
                    logo: item.logo,
                    description: item.description,
                    position: item.position,
                }))
                setStores(formatted)
            })
            .catch(err => console.error('MapEditorMap fetch error:', err))
    }, [])

    // sync refs
    useEffect(() => { zoomRef.current = zoom }, [zoom])
    useEffect(() => { panStateRef.current = pan }, [pan])

    useEffect(() => {
        const el = mapRef.current
        if (!el) return

        const wheelHandler = (e) => {
            e.preventDefault()
            requestAnimationFrame(() => {
                setZoom(z => {
                    const newZ = Math.min(Math.max(z + (e.deltaY > 0 ? -0.08 : 0.08), 0.5), 3)
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
                    y: e.clientY - panRef.current.y,
                }
                setIsPanning(true)
            }
        }

        const mouseMoveHandler = (e) => {
            if (!isPanningRef.current) return
            const newPan = {
                x: e.clientX - panStartRef.current.x,
                y: e.clientY - panStartRef.current.y,
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

    const toScreenPos = (xPct, yPct) => {
        const el = mapRef.current
        if (!el) return { x: 0, y: 0 }
        const cW = el.offsetWidth
        const cH = el.offsetHeight
        const cx = cW / 2
        const cy = cH / 2
        const z = zoomRef.current
        const p = panStateRef.current
        return {
            x: cx + ((xPct / 100) * cW - cx) * z + p.x,
            y: cy + ((yPct / 100) * cH - cy) * z + p.y,
        }
    }

    const getCentroid = (points) => ({
        x: points.reduce((s, p) => s + p.x, 0) / points.length,
        y: points.reduce((s, p) => s + p.y, 0) / points.length,
    })

    const currentFloorData = floors.find((f) => f.id === currentFloor)
    const storesOnFloor = stores.filter((s) => s.floor === currentFloor)
    const areasOnFloor = (areas ?? []).filter((a) => a.floor === currentFloor)

    const storeCount = (floorId) => stores.filter(s => s.floor === floorId).length

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800">Central Smart Mall</h1>
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Mall Map</h2>

            <div className="bg-white rounded-xl shadow-sm p-6">

                {/* Floor Tabs */}
                <div className="flex gap-2 mb-4">
                    {floors.map((floor) => (
                        <button
                            key={floor.id}
                            onClick={() => {
                                setCurrentFloor(floor.id)
                                setPan({ x: 0, y: 0 })
                                panRef.current = { x: 0, y: 0 }
                                panStateRef.current = { x: 0, y: 0 }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                                currentFloor === floor.id
                                    ? 'bg-gray-700 text-white border-gray-700'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {floor.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                currentFloor === floor.id ? 'bg-white text-gray-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {storeCount(floor.id)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Map Container */}
                <div
                    ref={mapRef}
                    className={`relative bg-gray-50 rounded-lg overflow-hidden h-80 border border-gray-100 ${
                        isPanning ? 'cursor-grabbing' : 'cursor-default'
                    }`}
                >
                    {/* Zoom label */}
                    <div className="absolute top-3 left-3 bg-white text-xs text-gray-500 px-2 py-1 rounded shadow-sm z-10">
                        {Math.round(zoom * 100)}%
                    </div>

                    {/* Zoom buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                        <button
                            onClick={() => setZoom(z => { const n = Math.min(z + 0.25, 3); zoomRef.current = n; return n })}
                            className="bg-white shadow rounded p-1 hover:bg-gray-50 w-8 h-8 flex items-center justify-center text-gray-600"
                        >+</button>
                        <button
                            onClick={() => setZoom(z => { const n = Math.max(z - 0.25, 0.5); zoomRef.current = n; return n })}
                            className="bg-white shadow rounded p-1 hover:bg-gray-50 w-8 h-8 flex items-center justify-center text-gray-600"
                        >−</button>
                    </div>

                    {/* Floor Image */}
                    <img
                        src={currentFloorData.image}
                        alt={`Floor ${currentFloor}`}
                        className="w-full h-full object-contain"
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transition: isPanning ? 'none' : 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            transformOrigin: 'center center',
                            willChange: 'transform',
                        }}
                        draggable={false}
                    />

                    {/* SVG Area Overlay */}
                    <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                        {areasOnFloor.map((area, i) => {
                            const pts = area.points.map(p => {
                                const s = toScreenPos(p.x, p.y)
                                return `${s.x},${s.y}`
                            }).join(' ')
                            return (
                                <polygon
                                    key={i}
                                    points={pts}
                                    fill={colors[i % colors.length]}
                                    stroke={strokes[i % strokes.length]}
                                    strokeWidth="1.5"
                                    strokeDasharray="4 2"
                                />
                            )
                        })}
                    </svg>

                    {/* Area Labels (store icon at centroid) */}
                    {areasOnFloor.map((area, i) => {
                        const centroid = getCentroid(area.points)
                        const screenPos = toScreenPos(centroid.x, centroid.y)
                        const store = stores.find(s => s.name === area.storeName)
                        return (
                            <div
                                key={i}
                                className="absolute z-20 pointer-events-none"
                                style={{ left: screenPos.x, top: screenPos.y, transform: 'translate(-50%, -100%)' }}
                            >
                                <div className="flex flex-col items-center">
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        border: `3px solid ${strokes[i % strokes.length]}`,
                                        background: 'white', overflow: 'hidden',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                                    }}>
                                        {store?.logo
                                            ? <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={store.name} />
                                            : store?.icon || '🏪'}
                                    </div>
                                    <div style={{
                                        width: 0, height: 0,
                                        borderLeft: '6px solid transparent',
                                        borderRight: '6px solid transparent',
                                        borderTop: `8px solid ${strokes[i % strokes.length]}`
                                    }} />
                                    <div style={{
                                        marginTop: 2,
                                        background: 'rgba(0,0,0,0.65)',
                                        color: 'white',
                                        fontSize: 10,
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {area.storeName}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Position Markers (stores with position) */}
                    {storesOnFloor.filter(s => s.position && !areasOnFloor.find(a => a.storeName === s.name)).map((store, i) => {
                        const pos = toScreenPos(store.position.x, store.position.y)
                        return (
                            <div
                                key={store.id}
                                className="absolute cursor-pointer z-20"
                                style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -100%)' }}
                                onClick={() => setSelectedStore(store)}
                            >
                                <div className="flex flex-col items-center group">
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        border: `3px solid ${strokes[i % strokes.length]}`,
                                        background: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden',
                                    }}>
                                        {store.logo
                                            ? <img src={store.logo} className="w-full h-full object-cover" alt={store.name} />
                                            : store.icon || '🏪'}
                                    </div>
                                    <div style={{
                                        width: 0, height: 0,
                                        borderLeft: '7px solid transparent',
                                        borderRight: '7px solid transparent',
                                        borderTop: `10px solid ${strokes[i % strokes.length]}`
                                    }} />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                        {store.name}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <p className="text-xs text-gray-400 text-center mt-2">
                    💡 Scroll to zoom • Middle click to pan • Click markers
                </p>
            </div>

            {/* Store Popup */}
            {selectedStore && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-2xl">
                                {selectedStore.logo
                                    ? <img src={selectedStore.logo} className="w-full h-full object-cover" alt={selectedStore.name} />
                                    : selectedStore.icon || '🏪'}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{selectedStore.name}</h3>
                                <p className="text-sm text-gray-400">Floor {selectedStore.floor}</p>
                            </div>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {selectedStore.category}
                        </span>
                        {selectedStore.description && (
                            <p className="mt-3 text-sm text-gray-500">{selectedStore.description}</p>
                        )}
                        <button
                            onClick={() => setSelectedStore(null)}
                            className="mt-4 w-full text-sm text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 rounded-lg py-2 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}