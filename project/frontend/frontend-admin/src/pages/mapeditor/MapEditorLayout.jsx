import { LayoutDashboard, Map, LogOut } from 'lucide-react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

export default function MapEditorLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/mapeditor/dashboard' },
    { label: 'Mall Map', icon: Map, path: '/mapeditor/map' },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col p-4">
        <div className="mb-8 mt-2">
          <h2 className="font-bold text-gray-800">Map Editor Portal</h2>
          <p className="text-xs text-gray-400">Edit mall stores</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        <div className="flex justify-end items-center px-8 py-4 bg-white border-b border-gray-200">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}