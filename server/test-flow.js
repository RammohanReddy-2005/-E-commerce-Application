const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('--- STARTING FLOW TEST ---');
  
  // 1. Register a test user
  console.log('\n1. Registering new user...');
  const email = `testuser_${Date.now()}@example.com`;
  let registerRes;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: email,
        password: 'password123'
      })
    });
    registerRes = await res.json();
    if (!res.ok) throw new Error(registerRes.message || 'HTTP error');
    console.log('Register Success! Role:', registerRes.role);
  } catch (err) {
    console.error('Register Failed:', err.message);
    return;
  }

  const token = registerRes.token;
  const authHeader = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  };

  // 2. Fetch products
  console.log('\n2. Fetching products...');
  let products = [];
  try {
    const res = await fetch(`${BASE_URL}/products`);
    products = await res.json();
    if (!res.ok) throw new Error(products.message || 'HTTP error');
    console.log(`Fetch Success! Found ${products.length} products.`);
  } catch (err) {
    console.error('Fetch Products Failed:', err.message);
    return;
  }

  if (products.length === 0) {
    console.error('No products found to order.');
    return;
  }

  const product = products[0];

  // 3. Create an order
  console.log('\n3. Placing an order...');
  try {
    const orderData = {
      items: [
        {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: 2
        }
      ],
      shippingAddress: {
        address: '456 Test Lane',
        city: 'Test City',
        postalCode: '67890',
        country: 'Testland'
      },
      totalPrice: product.price * 2,
      paymentMethod: 'Test Payment'
    };

    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(orderData)
    });
    const orderRes = await res.json();
    if (!res.ok) throw new Error(orderRes.message || 'HTTP error');
    
    console.log('Order Placement Success!');
    console.log('Placed Order Details:', JSON.stringify(orderRes, null, 2));
  } catch (err) {
    console.error('Order Placement Failed:', err.message);
    return;
  }

  // 4. Fetch my orders
  console.log('\n4. Fetching my orders...');
  try {
    const res = await fetch(`${BASE_URL}/orders/myorders`, {
      headers: authHeader
    });
    const myOrders = await res.json();
    if (!res.ok) throw new Error(myOrders.message || 'HTTP error');
    console.log(`Fetch My Orders Success! Found ${myOrders.length} orders.`);
  } catch (err) {
    console.error('Fetch My Orders Failed:', err.message);
    return;
  }

  console.log('\n--- FLOW TEST COMPLETED SUCCESSFULLY ---');
}

runTest();
