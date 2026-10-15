/**
 * seedProducts.js
 * Run: npm run seed:products
 * Seeds 5 Nethaji Tea Company products with placeholder prices.
 * Admin can edit prices/stock via the Admin Dashboard.
 * Idempotent: skips products that already exist (by name).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  {
    name: 'Varam Tea',
    description:
      'Varam Tea is a premium blend of handpicked CTC tea leaves with a rich, bold flavor and strong aroma. Perfect for a hearty morning cup.',
    image: 'uploads/varam-tea.jpg',
    category: 'CTC Tea',
    variants: [
      { weight: '1kg',  price: 420, stock: 50 },
      { weight: '500g', price: 220, stock: 80 },
      { weight: '200g', price: 100, stock: 100 },
      { weight: '100g', price: 55,  stock: 120 },
      { weight: '50g',  price: 30,  stock: 150 },
    ],
  },
  {
    name: 'Top Rose Tea',
    description:
      'Top Rose Tea offers a delicate floral fragrance blended with premium Assam tea leaves. A refreshing choice for afternoon tea lovers.',
    image: 'uploads/top-rose-tea.jpg',
    category: 'CTC Tea',
    variants: [
      { weight: '1kg',  price: 450, stock: 40 },
      { weight: '500g', price: 235, stock: 60 },
      { weight: '200g', price: 105, stock: 90 },
      { weight: '100g', price: 58,  stock: 110 },
      { weight: '50g',  price: 32,  stock: 140 },
    ],
  },
  {
    name: 'Subash Tea',
    description:
      'Subash Tea is a classic everyday blend with a smooth, mellow taste and deep amber color. A household favourite for all age groups.',
    image: 'uploads/subash-tea.jpg',
    category: 'CTC Tea',
    variants: [
      { weight: '1kg',  price: 400, stock: 55 },
      { weight: '500g', price: 210, stock: 70 },
      { weight: '200g', price: 95,  stock: 95 },
      { weight: '100g', price: 52,  stock: 130 },
      { weight: '50g',  price: 28,  stock: 160 },
    ],
  },
  {
    name: 'Masala Tea',
    description:
      'Nethaji Masala Tea is crafted with a special blend of ginger, cardamom, cinnamon, and clove spices mixed with strong CTC tea. A warming, spiced brew.',
    image: 'uploads/masala-tea.jpg',
    category: 'Masala Tea',
    variants: [
      { weight: '500g', price: 280, stock: 60 },
      { weight: '200g', price: 130, stock: 90 },
    ],
  },
  {
    name: 'Green Tea',
    description:
      'Nethaji Green Tea is made from tender, unoxidized tea leaves that preserve natural antioxidants. Light, refreshing, and great for wellness.',
    image: 'uploads/green-tea.jpg',
    category: 'Green Tea',
    variants: [
      { weight: '500g', price: 350, stock: 45 },
      { weight: '200g', price: 160, stock: 70 },
      { weight: '100g', price: 90,  stock: 100 },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const productData of products) {
      const existing = await Product.findOne({ name: productData.name });
      if (existing) {
        console.log(`⚠️  Skipped (already exists): ${productData.name}`);
        skipped++;
      } else {
        await Product.create(productData);
        console.log(`✅ Created: ${productData.name}`);
        created++;
      }
    }

    console.log(`\n📦 Seeding complete. Created: ${created}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
};

seed();
