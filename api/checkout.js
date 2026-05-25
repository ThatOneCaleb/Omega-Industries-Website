const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Product catalog for server-side price validation
const PRODUCTS = {
  'pc-001': { name: 'Wagner Manual Powder Gun', price: 129500 },
  'pc-002': { name: 'Wagner Flat Spray Nozzle', price: 4500 },
  'pc-003': { name: 'Wagner Conical Spray Nozzle', price: 4200 },
  'pc-004': { name: 'Powder Delivery Hose 25ft', price: 18900 },
  'pc-005': { name: 'Electrode Pin Assembly (10-Pack)', price: 7850 },
  'pc-006': { name: 'Powder Deflector Star', price: 3200 },
  'pc-007': { name: 'Booth Cartridge Filter 26x36', price: 24500 },
  'pc-008': { name: 'Gun Control Cable 15ft', price: 15600 },
  'pc-009': { name: 'Wagner Dense Phase Powder Pump', price: 285000 },
  'pc-010': { name: 'Wagner ITC 2 Controller', price: 349500 },
  'af-001': { name: '20x20x2 HVAC Panel Filter', price: 875 },
  'af-002': { name: '24x24x4 Pleated Air Filter', price: 1850 },
  'af-003': { name: '24x24x12 HEPA Panel Filter', price: 28900 },
  'af-004': { name: 'Donaldson Dust Cartridge 13x26', price: 16500 },
  'af-005': { name: 'Paint Booth Exhaust Pad 20x24', price: 425 },
  'af-006': { name: 'Spray Booth Intake Filter 20x25', price: 1250 },
  'af-007': { name: 'Bag Filter 6" x 58"', price: 4200 },
  'af-008': { name: 'Aluminum Washable Filter 20x20x2', price: 3800 },
  'af-009': { name: '16x20x1 Pleated Filter (Case of 12)', price: 6800 },
  'af-010': { name: '24x24x2 Carbon Panel Filter', price: 3400 },
  'lf-001': { name: 'HVLP Gravity Feed Spray Gun', price: 38500 },
  'lf-002': { name: 'Pressure Feed Spray Gun', price: 42500 },
  'lf-003': { name: 'CAT Pumps Diaphragm Pump 2:1', price: 115000 },
  'lf-004': { name: '2 Gallon Pressure Pot', price: 52500 },
  'lf-005': { name: 'Fluid Hose Assembly 3/8" x 25ft', price: 8900 },
  'lf-006': { name: 'Air Hose Assembly 3/8" x 50ft', price: 6200 },
  'lf-007': { name: 'Air Regulator with Gauge', price: 4800 },
  'lf-008': { name: 'HVLP Needle/Nozzle Kit 1.3mm', price: 6500 },
  'lf-009': { name: 'Spray Gun Rebuild Kit', price: 4200 },
  'lf-010': { name: 'Inline Paint Filter (Box of 100)', price: 5400 },
};

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, origin } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Build line items with server-side price validation
    const line_items = items.map(item => {
      const product = PRODUCTS[item.id];
      if (!product) {
        throw new Error(`Unknown product: ${item.id}`);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            metadata: { product_id: item.id },
          },
          unit_amount: product.price, // cents
        },
        quantity: Math.max(1, Math.min(999, parseInt(item.quantity) || 1)),
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin || 'https://omega-industries-website.vercel.app'}/shop-cart.html?success=true`,
      cancel_url: `${origin || 'https://omega-industries-website.vercel.app'}/shop-cart.html?canceled=true`,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Standard Shipping (5-7 business days)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'usd' },
            display_name: 'Express Shipping (2-3 business days)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
      ],
      automatic_tax: { enabled: false },
      metadata: {
        order_summary: items.map(item => {
          const product = PRODUCTS[item.id];
          return `${item.quantity}x ${product.name} (${item.id})`;
        }).join(' | '),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
