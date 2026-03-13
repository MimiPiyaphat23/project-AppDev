import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MapEditorLogin() {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: เชื่อม API login จริงทีหลัง
    alert('Map Editor Login!')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to role selection
        </button>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-bold text-gray-800">Map Editor Login</h2>
          <p className="text-gray-400 text-sm mb-6">Sign in to edit the mall map</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] focus:border-[#ECDEAB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] focus:border-[#ECDEAB]"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg font-medium"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">
          Demo credentials: Any email and password will work
        </p>
      </div>
    </div>
  )
}