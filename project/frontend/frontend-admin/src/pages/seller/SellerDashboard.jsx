import { useEffect, useState } from 'react'
import { Package, Pencil, Trash2 } from 'lucide-react'
import { useStores } from '../../context/StoreContext'

export default function SellerDashboard() {
    const { stores: products, setStores: setProducts } = useStores()
    const [editProduct, setEditProduct] = useState(null)
    const [isAdding, setIsAdding] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        stock: '',
        logo: null,
        category_id: 1
    })

    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length

    // โหลดข้อมูลจริงมาแสดงใน Dashboard
    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch('http://localhost:5000/api/products/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login'; // หรือหน้า login ของคุณ
                    return;
                }

                const result = await res.json();
                if (result.success) {
                    setProducts(result.data.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        stock: p.stock,
                        status: p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock'
                    })));
                }
            } catch (err) { console.error("Load error:", err); }
        };
        loadData();
    }, []);

    const handleAdd = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Session expired. Please login again.");
                return;
            }

            const response = await fetch('http://localhost:5000/api/products/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    name: newProduct.name,
                    price: parseFloat(newProduct.price) || 0.0,
                    stock: parseInt(newProduct.stock) || 0,
                    store_id: 1, // ระบุ Store ID ที่ต้องการเพิ่มสินค้าให้ (สำหรับ Admin)
                    category_id: newProduct.category_id || 1,
                    image_url: ""
                })
            });

            if (response.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }

            const result = await response.json();
            if (response.ok && result.success) {
                window.location.reload();
            } else {
                alert(result.message || "Failed to create product (Error 401/403)");
            }
        } catch (error) {
            console.error("Add error:", error);
            alert("Network error. Please check if Backend is running.");
        }
    }

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/products/${editProduct.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    name: editProduct.name,
                    price: parseFloat(editProduct.price),
                    stock: parseInt(editProduct.stock)
                })
            });

            if (response.ok) {
                alert("Product updated successfully");
                setEditProduct(null);
                window.location.reload();
            } else {
                const result = await response.json();
                alert(result.message || "Update failed");
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    }

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/products/${deleteId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                alert("Product deleted successfully");
                setDeleteId(null);
                window.location.reload();
            } else {
                const result = await response.json();
                alert(result.message || "Delete failed");
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
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
                    <button onClick={() => setIsAdding(true)} 
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl overflow-hidden">
                                        {product.logo
                                            ? <img src={product.logo} alt={product.name} className="w-full h-full object-cover" />
                                            : product.icon || '🏪'}
                                    </div>
                                    {product.name}
                                </td>
                                <td className="py-3 text-gray-700">{product.price ? `฿${product.price}` : '-'}</td>
                                <td className="py-3 text-gray-700">{product.stock ?? '-'}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        product.status === 'In Stock' ? 'bg-gray-700 text-white'
                                        : product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700'
                                        : product.status === 'Out of Stock' ? 'bg-red-100 text-red-600'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {product.status || product.category || '-'}
                                    </span>
                                </td>
                                <td className="py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditProduct({ ...product })}
                                            className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDeleteId(product.id)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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
                                <input type="text" value={editProduct.name}
                                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (฿)</label>
                                <input type="number" value={editProduct.price || ''}
                                    onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                <input type="number" value={editProduct.stock || ''}
                                    onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                {editProduct.logo && (
                                    <img src={editProduct.logo} alt="preview" className="w-20 h-20 rounded object-cover mb-2" />
                                )}
                                <input type="file" accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) setEditProduct({ ...editProduct, logo: URL.createObjectURL(file) })
                                    }}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setEditProduct(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                            <button onClick={handleUpdate} className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg font-medium">
                                Update Product
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Add New Product</h3>
                                <p className="text-sm text-gray-400">Enter product details</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-700">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input type="text" value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]" placeholder="Product name..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (฿)</label>
                                <input type="number" value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                <input type="number" value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECDEAB]" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                <input type="file" accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) setNewProduct({ ...newProduct, logo: URL.createObjectURL(file) })
                                    }}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                            <button onClick={handleAdd} className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg font-medium">
                                Create Product
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
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product</h3>
                        <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
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