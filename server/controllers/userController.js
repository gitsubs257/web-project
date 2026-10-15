const User = require('../models/User');

// ─── GET /api/user/profile ────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/user/profile ────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (firstName) user.firstName = firstName;
    if (lastName)  user.lastName  = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json({ message: 'Profile updated', user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/user/addresses ──────────────────────────────────────────────────
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── POST /api/user/addresses ─────────────────────────────────────────────────
const addAddress = async (req, res) => {
  try {
    const { fullName, phone, doorNo, street, area, city, state, pincode, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    // If new address is default, unset all others
    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    user.addresses.push({ fullName, phone, doorNo, street, area, city, state, pincode, isDefault: !!isDefault });
    await user.save();
    res.status(201).json({ message: 'Address added', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/user/addresses/:addressId ───────────────────────────────────────
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const { fullName, phone, doorNo, street, area, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    if (fullName !== undefined) addr.fullName = fullName;
    if (phone !== undefined)    addr.phone = phone;
    if (doorNo !== undefined)   addr.doorNo = doorNo;
    if (street !== undefined)   addr.street = street;
    if (area !== undefined)     addr.area = area;
    if (city !== undefined)     addr.city = city;
    if (state !== undefined)    addr.state = state;
    if (pincode !== undefined)  addr.pincode = pincode;
    if (isDefault !== undefined) addr.isDefault = !!isDefault;

    await user.save();
    res.json({ message: 'Address updated', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/user/addresses/:addressId ────────────────────────────────────
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    addr.deleteOne();
    await user.save();
    res.json({ message: 'Address removed', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/user/addresses/:addressId/default ───────────────────────────────
const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === req.params.addressId;
    });
    await user.save();
    res.json({ message: 'Default address updated', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
