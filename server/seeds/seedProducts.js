/**
 * seedProducts.js
 * Run: npm run seed:products
 * Seeds 5 Nethaji Tea Company products with placeholder prices.
 * Admin can edit prices/stock via the Admin Dashboard.
 * Idempotent: skips products that already exist (by name).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Product = require('../models/Product');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const products = [
  {
    name: 'Varam Tea',
    description:
      'Varam Tea is an exquisite single-origin blend of handpicked Upper Assam CTC tea leaves with a rich, malty flavor, golden liquor, and robust morning aroma. Perfect for traditional milk chai or black tea.',
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
      'Top Rose Tea blends aromatic dried damask rose petals with select golden-tip Upper Assam CTC tea leaves. Delivers an enchanting floral bouquet with the deep brisk body of pure Assam tea.',
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
      'Subash Tea is our signature Brahmaputra River Valley everyday blend with a velvety smooth malty finish and rich amber color. A revered household staple across generations.',
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
      'Nethaji Masala Tea fuses bold Upper Assam CTC tea leaves with slow-roasted traditional spices: sun-dried dry ginger, green cardamom, sweet cinnamon, and aromatic cloves. An invigorating, spiced elixir.',
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
      'Nethaji Green Tea is harvested from unoxidized tender Assam tea shoots, gently pan-steamed to lock in delicate antioxidants, polyphenols, and a fresh grassy sweetness.',
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
