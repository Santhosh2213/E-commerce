const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get all vendors (pending approval)
const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve vendor
const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    vendor.vendorInfo.isApproved = true;
    await vendor.save();
    res.json({ message: 'Vendor approved', vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get platform stats
const getStats = async () => {
  const totalVendors = await User.countDocuments({ role: 'vendor', 'vendorInfo.isApproved': true });
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
  return { totalVendors, totalCustomers, totalOrders, totalRevenue: totalRevenue[0]?.total || 0 };
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getVendors, approveVendor, getDashboardStats };