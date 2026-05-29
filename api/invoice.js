const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Product catalog for server-side price validation (mirrors checkout.js)
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
    const { items, company } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Validate company info
    if (!company || !company.name || !company.email || !company.address) {
      return res.status(400).json({ error: 'Company name, email, and address are required' });
    }

    const { address } = company;
    if (!address.line1 || !address.city || !address.state || !address.postal_code) {
      return res.status(400).json({ error: 'Complete billing address is required (street, city, state, ZIP)' });
    }

    // Validate all product IDs before making any Stripe calls
    for (const item of items) {
      if (!PRODUCTS[item.id]) {
        return res.status(400).json({ error: `Unknown product: ${item.id}` });
      }
    }

    // 1. Create Stripe Customer
    const customerData = {
      name: company.name,
      email: company.email,
      address: {
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: 'US',
      },
      metadata: {
        source: 'omega-b2b-invoice',
        po_number: company.poNumber || '',
      },
    };

    if (company.taxId) {
      customerData.tax_id_data = [{ type: 'us_ein', value: company.taxId }];
    }

    const customer = await stripe.customers.create(customerData);

    // 2. Create Invoice Items
    for (const item of items) {
      const product = PRODUCTS[item.id];
      await stripe.invoiceItems.create({
        customer: customer.id,
        description: product.name,
        unit_amount: product.price,
        currency: 'usd',
        quantity: Math.max(1, Math.min(999, parseInt(item.quantity) || 1)),
        metadata: { product_id: item.id },
      });
    }

    // 3. Create Invoice with Net-30 terms
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 30,
      auto_advance: true,
      metadata: {
        po_number: company.poNumber || '',
        order_summary: items.map(item => {
          const product = PRODUCTS[item.id];
          return `${item.quantity}x ${product.name} (${item.id})`;
        }).join(' | '),
      },
    });

    // 4. Finalize and send
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(finalized.id);

    res.status(200).json({
      success: true,
      invoiceNumber: finalized.number,
      invoiceUrl: finalized.hosted_invoice_url,
      email: company.email,
    });
  } catch (err) {
    console.error('Stripe invoice error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
