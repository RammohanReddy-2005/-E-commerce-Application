import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { createOrder } from '../api/services';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const orderData = {
      items: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.qty
      })),
      shippingAddress: {
        address: '123 Dummy St',
        city: 'Metropolis',
        postalCode: '12345',
        country: 'Country'
      },
      totalPrice: totalAmount,
      paymentMethod: 'Dummy Payment'
    };

    try {
      await createOrder(orderData);
      localStorage.removeItem('cart');
      setCartItems([]);
      alert('Order placed successfully (Dummy Payment)');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 text-gray-400 rounded-full mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="btn btn-primary px-8 py-3">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <li key={item._id} className="p-6 flex flex-col sm:flex-row items-center">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-contain bg-gray-50 rounded p-2 mb-4 sm:mb-0" />
              <div className="sm:ml-6 flex-1 text-center sm:text-left">
                <Link to={`/product/${item._id}`} className="text-lg font-semibold text-gray-800 hover:text-primary">
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">Qty: {item.qty}</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                <p className="text-lg font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
            <p className="text-3xl font-extrabold text-gray-900">${totalAmount.toFixed(2)}</p>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="btn btn-primary px-8 py-3 w-full sm:w-auto text-lg"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
