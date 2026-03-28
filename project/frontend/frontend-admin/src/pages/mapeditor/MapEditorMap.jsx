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
    const { stores } = useStores()

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

    // ✅ ใช้ backend position
    const storesOnFloor = stores.filter(s => s.floor === currentFloor)

    const storeCount = (floorId) =>
        stores.filter(s => s.floor === floorId).length

    const strokes = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']

    useEffect(() => {
        const el = mapRef.current
        if (!el) return

        const wheelHandler = (e) => {
            e.preventDefault()
            requestAnimationFrame(() => {
                setZoom(z =>
                    Math.min(Math.max(z + (e.deltaY > 0 ? -0.08 : 0.08), 0.5), 3)
                )
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

        return {
            x: cx + ((xPct / 100) * cW - cx) * zoom + pan.x,
            y: cy + ((yPct / 100) * cH - cy) * zoom + pan.y,
        }
    }

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
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                                currentFloor === floor.id
                                    ? 'bg-gray-700 text-white border-gray-700'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {floor.label}
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                {storeCount(floor.id)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Map */}
                <div
                    ref={mapRef}
                    className={`relative bg-gray-50 rounded-lg overflow-hidden h-80 border ${
                        isPanning ? 'cursor-grabbing' : 'cursor-default'
                    }`}
                >
                    {/* Zoom */}
                    <div className="absolute top-3 left-3 bg-white text-xs px-2 py-1 rounded shadow z-10">
                        {Math.round(zoom * 100)}%
                    </div>

                    {/* Zoom buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                        <button
                            onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                            className="bg-white shadow rounded w-8 h-8"
                        >+</button>
                        <button
                            onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                            className="bg-white shadow rounded w-8 h-8"
                        >−</button>
                    </div>

                    {/* Floor Image */}
                    <img
                        src={currentFloorData.image}
                        alt=""
                        className="w-full h-full object-contain"
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: 'center'
                        }}
                        draggable={false}
                    />

                    {/* ✅ MARKERS FROM BACKEND */}
                    {storesOnFloor.map((store, i) => {
                        if (!store.position) return null

                        const pos = toScreenPos(
                            store.position.x,
                            store.position.y
                        )

                        return (
                            <div
                                key={store.id}
                                className="absolute cursor-pointer"
                                style={{
                                    left: pos.x,
                                    top: pos.y,
                                    transform: 'translate(-50%, -100%)'
                                }}
                                onClick={() => setSelectedStore(store)}
                            >
                                <div className="flex flex-col items-center group">
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            border: `3px solid ${strokes[i % strokes.length]}`,
                                            background: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {store.logo
                                            ? <img src={store.logo} className="w-full h-full object-cover" />
                                            : store.icon || '🏪'}
                                    </div>

                                    <div
                                        style={{
                                            width: 0,
                                            height: 0,
                                            borderLeft: '7px solid transparent',
                                            borderRight: '7px solid transparent',
                                            borderTop: `10px solid ${strokes[i % strokes.length]}`
                                        }}
                                    />

                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
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

            {/* Popup */}
            {selectedStore && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-80">
                        <h3 className="font-bold text-lg">{selectedStore.name}</h3>
                        <p className="text-sm text-gray-400">
                            Floor {selectedStore.floor}
                        </p>

                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {selectedStore.category?.name}
                        </span>

                        {selectedStore.description && (
                            <p className="mt-2 text-sm text-gray-500">
                                {selectedStore.description}
                            </p>
                        )}

                        <button
                            onClick={() => setSelectedStore(null)}
                            className="mt-4 text-sm text-red-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}