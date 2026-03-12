import { User, Map } from 'lucide-react'

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
      <p className="text-gray-500 mb-10">Select your role to continue</p>

      <div className="flex gap-6">
        {/* Seller Card */}
        <div className="bg-white rounded-xl shadow p-8 w-72 flex flex-col items-center">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Seller</h2>
          <p className="text-gray-400 text-sm mb-4">Manage your store products</p>
          <ul className="text-gray-400 text-sm w-full space-y-1 mb-6">
            <li>• Add, edit, and delete products</li>
            <li>• Update product stock levels</li>
            <li>• Manage product pricing</li>
            <li>• View product analytics</li>
          </ul>
          <button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg font-medium">
            Login as Seller
          </button>
        </div>

        {/* Map Editor Card */}
        <div className="bg-white rounded-xl shadow p-8 w-72 flex flex-col items-center">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <Map className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Map Editor</h2>
          <p className="text-gray-400 text-sm mb-4">Manage mall directory map</p>
          <ul className="text-gray-400 text-sm w-full space-y-1 mb-6">
            <li>• Add new stores to the map</li>
            <li>• Remove closed stores</li>
            <li>• Update store locations</li>
            <li>• Manage floor layouts</li>
          </ul>
          <button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg font-medium">
            Login as Map Editor
          </button>
        </div>
      </div>
    </div>
  )
}