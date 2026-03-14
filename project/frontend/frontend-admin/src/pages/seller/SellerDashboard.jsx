import { useState } from 'react'
import { Package, Pencil, Trash2 } from 'lucide-react'

const initialProducts = [
    { id: 1, name: 'Cotton T-Shirt', price: 29.99, stock: 45, status: 'In Stock', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=40&h=40&fit=crop' },
    { id: 2, name: 'Denim Jeans', price: 79.99, stock: 32, status: 'In Stock', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=40&h=40&fit=crop' },
    { id: 3, name: 'Sneakers', price: 59.99, stock: 3, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40&h=40&fit=crop' },
    { id: 4, name: 'Leather Wallet', price: 39.99, stock: 0, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=40&h=40&fit=crop' },
]

export default function SellerDashboard() {
    const [products, setProducts] = useState(initialProducts)
    const [editProduct, setEditProduct] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length

    const handleEdit = (product) => {
        setEditProduct({ ...product })
    }

    const handleUpdate = () => {
        setProducts(products.map((p) =>
            p.id === editProduct.id
                ? {
                    ...editProduct,
                    status: editProduct.stock === 0 ? 'Out of Stock' : editProduct.stock <= 5 ? 'Low Stock' : 'In Stock'
                }
                : p
        ))
        setEditProduct(null)
    }

    const handleDelete = () => {
        setProducts(products.filter((p) => p.id !== deleteId))
        setDeleteId(null)
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800">Central Smart Mall</h1>
            <p className="text-gray-400 mb-1">Tech World</p>
            <h2 className="text-lg font-semibold text-gray-700">Seller Dashboard</h2>
            <p className="text-gray-400 text-sm mb-6">Manage your product inventory</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Total Products</p>
                        <Package className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{products.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Across all stores</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Total Stock</p>
                        <Package className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{totalStock}</p>
                    <p className="text-xs text-gray-400 mt-1">Items in inventory</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500">Low Stock Items</p>
                        <Package className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{lowStock}</p>
                    <p className="text-xs text-gray-400 mt-1">Need restocking</p>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="font-semibold text-gray-700">Products</p>
                        <p className="text-xs text-gray-400">Manage your product inventory</p>
                    </div>
                    <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        + Add Product
                    </button>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-100">
                            <th className="pb-3 font-medium">Product</th>
                            <th className="pb-3 font-medium">Price</th>
                            <th className="pb-3 font-medium">Stock</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="py-3 flex items-center gap-3">
                                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                    {product.name}
                                </td>
                                <td className="py-3 text-gray-700">฿{product.price}</td>
                                <td className="py-3 text-gray-700">{product.stock}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'In Stock' ? 'bg-gray-700 text-white'
                                        : product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-600'
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(product.id)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editProduct && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Edit Product</h3>
                                <p className="text-sm text-gray-400">Update product information</p>
                            </div>
                            <button onClick={() => setEditProduct(null)} className="text-gray-400 hover:text-gray-700">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={editProduct.name}
                                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (฿)</label>
                                <input
                                    type="number"
                                    value={editProduct.price}
                                    onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                <input
                                    type="number"
                                    value={editProduct.stock}
                                    onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                {editProduct.image && (
                                    <img
                                        src={editProduct.image}
                                        alt="preview"
                                        className="w-20 h-20 rounded object-cover mb-2"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            const url = URL.createObjectURL(file)
                                            setEditProduct({ ...editProduct, image: url })
                                        }
                                    }}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditProduct(null)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg font-medium"
                            >
                                Update Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {deleteId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product</h3>
                        <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}