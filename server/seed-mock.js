const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function seed() {
  const usersPath = path.join(__dirname, 'db_users.json');
  const productsPath = path.join(__dirname, 'db_products.json');
  const ordersPath = path.join(__dirname, 'db_orders.json');

  // 1. Create Admin User
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  const adminId = '653c1a3b8e4f1a2b3c4d5e6f';

  const adminUser = {
    _id: adminId,
    name: 'ShopEZ Admin',
    email: 'admin@shopez.com',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(usersPath, JSON.stringify([adminUser], null, 2));
  console.log('Seeded Admin User: admin@shopez.com / admin123');

  // 2. Create Sample Products
  const sampleProducts = [
    {
      _id: '653c1b3b8e4f1a2b3c4d5e70',
      name: 'Wireless Noise-Canceling Headphones',
      description: 'Experience premium sound quality with active noise-canceling technology, 40-hour battery life, and comfortable over-ear design.',
      price: 199.99,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      stock: 15,
      rating: 4.8,
      numReviews: 24,
      reviews: [],
      seller: adminId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '653c1b3b8e4f1a2b3c4d5e71',
      name: 'Minimalist Leather Watch',
      description: 'Elegant leather strap analog watch with a clean white dial. Water-resistant and suitable for both formal and casual occasions.',
      price: 129.50,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      stock: 30,
      rating: 4.5,
      numReviews: 12,
      reviews: [],
      seller: adminId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '653c1b3b8e4f1a2b3c4d5e72',
      name: 'Ergonomic Office Chair',
      description: 'High-back desk chair featuring adjustable lumbar support, 3D armrests, breathable mesh back, and synchro-tilt mechanism.',
      price: 349.99,
      category: 'Furniture',
      image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      stock: 8,
      rating: 4.7,
      numReviews: 8,
      reviews: [],
      seller: adminId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  fs.writeFileSync(productsPath, JSON.stringify(sampleProducts, null, 2));
  console.log('Seeded 3 Sample Products');

  // 3. Ensure orders file exists
  if (!fs.existsSync(ordersPath)) {
    fs.writeFileSync(ordersPath, JSON.stringify([], null, 2));
  }
}

seed().catch(err => console.error('Seeding failed:', err));
