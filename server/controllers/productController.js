const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// ─── GET /api/products ────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/products/all (admin: includes inactive) ─────────────────────────
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/products/:id ────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── POST /api/products (admin) ───────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, category, variants } = req.body;
    if (!name) return res.status(400).json({ message: 'Product name is required' });

    // Parse variants (sent as JSON string from multipart form)
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      } catch {
        return res.status(400).json({ message: 'Invalid variants format' });
      }
    }

    const imagePath = req.file ? `uploads/${req.file.filename}` : '';

    const product = await Product.create({
      name,
      description: description || '',
      image: imagePath,
      category: category || 'Tea',
      variants: parsedVariants,
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/products/:id (admin) ────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, category, variants, isActive } = req.body;

    if (name !== undefined)        product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined)    product.category = category;
    if (isActive !== undefined)    product.isActive = isActive === 'true' || isActive === true;

    if (variants) {
      try {
        product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      } catch {
        return res.status(400).json({ message: 'Invalid variants format' });
      }
    }

    // Update image if new file uploaded
    if (req.file) {
      // Remove old image file
      if (product.image) {
        const oldPath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.image = `uploads/${req.file.filename}`;
    }

    await product.save();
    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/products/:id (admin) ─────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Remove associated image
    if (product.image) {
      const imgPath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProducts, getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
