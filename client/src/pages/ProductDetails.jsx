import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetails } from '../api/services';
import { Loader2, ArrowLeft, Star, ShoppingCart } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await getProductDetails(id);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/cart');
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 p-6 md:p-10 flex items-center justify-center bg-gray-50">
          <img src={product.image} alt={product.name} className="max-w-full h-auto object-contain max-h-[400px] hover:scale-105 transition-transform duration-500" />
        </div>
        
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-2">{product.category}</h2>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-yellow-700 ml-1 font-bold">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500 ml-3">({product.numReviews} reviews)</span>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
          
          <div className="flex items-center justify-between mt-auto">
            <span className="text-4xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
            <button 
              onClick={addToCart}
              disabled={product.stock === 0}
              className={`btn flex items-center px-6 py-3 text-lg ${product.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : 'btn-primary'}`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
