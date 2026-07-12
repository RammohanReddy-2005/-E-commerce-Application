import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, createProduct } from '../api/services';
import { Package, Plus, ClipboardList, LogOut } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    stock: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('adminUser'));
    if (!token || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await getAllOrders();
      setOrders(data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const handleProductChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createProduct({
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock)
      });
      alert('Product created successfully');
      setProductData({ name: '', price: '', description: '', image: '', category: '', stock: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <nav className="bg-white shadow-sm border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-primary mr-2" />
              <span className="font-bold text-xl text-slate-800 tracking-tight">ShopEZ Admin</span>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="flex items-center text-slate-500 hover:text-red-600 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4 md:mb-0">Dashboard Overview</h1>
          <div className="flex space-x-2 bg-slate-200/60 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                activeTab === 'orders' ? 'bg-white shadow text-primary' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manage Orders
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                activeTab === 'products' ? 'bg-white shadow text-primary' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Add Product
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 font-medium">{error}</div>}

        {activeTab === 'orders' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center">
              <ClipboardList className="w-5 h-5 text-slate-500 mr-2" />
              <h2 className="text-lg font-bold text-slate-800">Recent Customer Orders</h2>
            </div>
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">No orders found in the system.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Date Placed</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Order Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm font-mono text-slate-600 font-medium">{order._id.substring(18)}</td>
                        <td className="p-4 text-sm text-slate-800 font-medium">{order.user?.name || 'Guest User'}</td>
                        <td className="p-4 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="p-4 text-sm font-bold text-slate-900">${order.totalPrice.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center">
              <Plus className="w-5 h-5 text-slate-500 mr-2" />
              <h2 className="text-lg font-bold text-slate-800">Add New Product to Catalog</h2>
            </div>
            <form onSubmit={handleCreateProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                  <input required type="text" name="name" className="input-field" value={productData.name} onChange={handleProductChange} placeholder="e.g. Wireless Headphones" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <input required type="text" name="category" className="input-field" value={productData.category} onChange={handleProductChange} placeholder="e.g. Electronics" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (USD)</label>
                  <input required type="number" step="0.01" name="price" className="input-field" value={productData.price} onChange={handleProductChange} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity</label>
                  <input required type="number" name="stock" className="input-field" value={productData.stock} onChange={handleProductChange} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Image URL (Optional)</label>
                <input type="url" name="image" className="input-field" value={productData.image} onChange={handleProductChange} placeholder="https://example.com/image.jpg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Detailed Description</label>
                <textarea required name="description" rows="5" className="input-field resize-none" value={productData.description} onChange={handleProductChange} placeholder="Describe the product features and benefits..."></textarea>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button type="submit" disabled={loading} className="btn btn-primary w-full md:w-auto md:px-8 py-3 font-bold text-sm shadow-md hover:shadow-lg">
                  {loading ? 'Publishing Product...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
