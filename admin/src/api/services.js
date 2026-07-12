import api from './index';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const createProduct = (productData) => api.post('/products', productData);
export const getAllOrders = () => api.get('/orders');
