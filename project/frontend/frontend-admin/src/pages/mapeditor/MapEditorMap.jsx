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

export default function MapEditorMap() {
    const { stores, areas } = useStores()
    const [currentFloor, setCurrentFloor] = useState('LG')
    const [zoom, setZoom] = useState(1.5)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [selectedStore, setSelectedStore] = useState(null)

    const mapRef = useRef(null)
    const isPanningRef = useRef(false)
    const panStartRef = useRef({ x: 0, y: 0 })
    const panRef = useRef({ x: 0, y: 0 })

    const currentFloorData = floors.find((f) => f.id === currentFloor)
    const storeCount = (floorId) => stores.filter(s => s.floor === floorId).length
    const areasOnFloor = areas.filter(a => a.floor === currentFloor)

    const strokes = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']
    const colors = ['rgba(99,102,241,0.15)', 'rgba(16,185,129,0.15)', 'rgba(245,158,11,0.15)', 'rgba(239,68,68,0.15)', 'rgba(59,130,246,0.15)']

    useEffect(() => {
        const el = mapRef.current
        if (!el) return

        const wheelHandler = (e) => {
            e.preventDefault()
            requestAnimationFrame(() => {
                setZoom(z => Math.min(Math.max(z + (e.deltaY > 0 ? -0.08 : 0.08), 0.5), 3))
            })
        }

        const mouseDownHandler = (e) => {
            if (e.button === 1) {
                e.preventDefault()
                isPanningRef.current = true
                panStartRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y }
                setIsPanning(true)
            }
        }

        const mouseMoveHandler = (e) => {
            if (!isPanningRef.current) return
            const newPan = { x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y }
            panRef.current = newPan
            setPan({ ...newPan })
        }

        const mouseUpHandler = () => { isPanningRef.current = false; setIsPanning(false) }

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
        const cW = el.offsetWidth, cH = el.offsetHeight
        const cx = cW / 2, cy = cH / 2
        return {
            x: cx + ((xPct / 100) * cW - cx) * zoom + pan.x,
            y: cy + ((yPct / 100) * cH - cy) * zoom + pan.y,
        }
    }

    const getCentroid = (points) => ({
        x: points.reduce((s, p) => s + p.x, 0) / points.length,
        y: points.reduce((s, p) => s + p.y, 0) / points.length,
    })

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
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${currentFloor === floor.id
                                ? 'bg-gray-700 text-white border-gray-700'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {floor.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${currentFloor === floor.id ? 'bg-white text-gray-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {storeCount(floor.id)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Map Container */}
                <div
                    ref={mapRef}
                    className={`relative bg-gray-50 rounded-lg overflow-hidden h-80 border border-gray-100 ${isPanning ? 'cursor-grabbing' : 'cursor-default'
                        }`}
                >
                    <div className="absolute top-3 left-3 bg-white text-xs text-gray-500 px-2 py-1 rounded shadow-sm z-10">
                        {Math.round(zoom * 100)}%
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                        <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                            className="bg-white shadow rounded p-1 hover:bg-gray-50 w-8 h-8 flex items-center justify-center text-gray-600">+</button>
                        <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
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

                    {/* SVG Areas */}
                    <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                        {areasOnFloor.map((area, i) => {
                            const pts = area.points.map(p => {
                                const s = toScreenPos(p.x, p.y)
                                return `${s.x},${s.y}`
                            }).join(' ')
                            return (
                                <polygon key={i} points={pts}
                                    fill={colors[i % colors.length]}
                                    stroke={strokes[i % strokes.length]}
                                    strokeWidth="1.5" strokeDasharray="4 2" />
                            )
                        })}
                    </svg>

                    {/* Markers */}
                    {areasOnFloor.map((area, i) => {
                        const centroid = getCentroid(area.points)
                        const screenPos = toScreenPos(centroid.x, centroid.y)
                        const store = stores.find(s => s.name === area.storeName)
                        return (
                            <div key={i} className="absolute z-20 cursor-pointer"
                                style={{ left: screenPos.x, top: screenPos.y, transform: 'translate(-50%, -100%)' }}
                                onClick={() => setSelectedStore(store)}
                            >
                                <div className="flex flex-col items-center group">
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        border: `3px solid ${strokes[i % strokes.length]}`,
                                        background: 'white', overflow: 'hidden',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}>
                                        {store?.logo
                                            ? <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={store?.name} />
                                            : store?.icon || '🏪'}
                                    </div>
                                    <div style={{
                                        width: 0, height: 0,
                                        borderLeft: '7px solid transparent',
                                        borderRight: '7px solid transparent',
                                        borderTop: `10px solid ${strokes[i % strokes.length]}`
                                    }} />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        {store?.name}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <p className="text-xs text-gray-400 text-center mt-2">
                    💡 Scroll to zoom • Middle click to pan • Click markers to view store info
                </p>
            </div>

            {/* Store Info Popup */}
            {selectedStore && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                                    {selectedStore.logo
                                        ? <img src={selectedStore.logo} className="w-full h-full object-cover" alt={selectedStore.name} />
                                        : selectedStore.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{selectedStore.name}</h3>
                                    <p className="text-xs text-gray-400">Floor {selectedStore.floor}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStore(null)} className="text-gray-400 hover:text-gray-700">✕</button>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{selectedStore.category}</span>
                        {selectedStore.description && (
                            <p className="text-sm text-gray-500 mt-3">{selectedStore.description}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}