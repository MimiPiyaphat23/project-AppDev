import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function SellerLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.login({ email, password })
      const user = res.data.user || res.data.data
      if (user?.role !== 'StoreOwner') {
        throw new Error('บัญชีนี้ไม่ใช่ StoreOwner')
      }
      localStorage.setItem('admin_token', res.data.token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      navigate('/seller/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to role selection
        </button>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-bold text-gray-800">Seller Login</h2>
          <p className="text-gray-400 text-sm mb-6">Sign in to manage your products</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="storeowner@example.com" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] focus:border-[#ECDEAB]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB] focus:border-[#ECDEAB]" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-gray-700 hover:bg-gray-800 disabled:opacity-60 text-white py-2 rounded-lg font-medium">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
