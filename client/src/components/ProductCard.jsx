import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="card group cursor-pointer">
      <Link to={`/product/${product._id}`}>
        <div className="relative pt-[100%] overflow-hidden bg-gray-100">
          <img 
            src={product.image} 
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2 truncate">{product.category}</p>
        
        <div className="flex items-center mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600 ml-1 font-medium">{product.rating}</span>
          <span className="text-xs text-gray-400 ml-1">({product.numReviews})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <Link to={`/product/${product._id}`} className="btn btn-outline text-sm py-1 px-3">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
