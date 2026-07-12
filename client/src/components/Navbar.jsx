import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
            ShopEZ
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/cart" className="text-gray-600 hover:text-primary transition-colors flex items-center group">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="ml-1 hidden sm:block">Cart</span>
            </Link>
            
            {token ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-gray-600 hover:text-primary transition-colors flex items-center group">
                  <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="ml-1 hidden sm:block">Profile</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-500 transition-colors flex items-center group"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-primary transition-colors font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary text-sm py-1.5 px-4 shadow-sm hover:shadow">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
