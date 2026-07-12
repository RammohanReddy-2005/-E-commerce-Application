import api from './index';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (name, email, password) => api.post('/auth/register', { name, email, password });
export const getProfile = () => api.get('/auth/profile');

export const getProducts = () => api.get('/products');
export const getProductDetails = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) => api.post('/products', productData);

export const createOrder = (orderData) => api.post('/orders', orderData);
export const getMyOrders = () => api.get('/orders/myorders');
export const getAllOrders = () => api.get('/orders');
