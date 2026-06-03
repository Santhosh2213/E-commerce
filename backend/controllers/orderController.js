const Order = require('../models/Order');
const Cart = require('../models/Cart');
const razorpay = require('../config/razorpay');

// Create order from cart and initiate Razorpay payment
const createOrder = async (req, res) => {
  try {
    const { address, paymentMethod } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cart.totalPrice;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      userId: req.user.id,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        vendorId: item.vendorId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount,
      paymentMethod,
      address,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'pending',
    });

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    res.status(201).json({
      order,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify payment after successful Razorpay payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const crypto = require('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    res.json({ message: 'Payment verified', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders for vendor's products
const getVendorOrders = async (req, res) => {
    try {
      const orders = await Order.find({ 'items.vendorId': req.user.id })
        .populate('userId', 'name email')
        .sort('-createdAt');
      
      // Transform to show only vendor's items in each order
      const vendorOrders = orders.map(order => ({
        ...order.toObject(),
        items: order.items.filter(item => item.vendorId.toString() === req.user.id),
      }));
      res.json(vendorOrders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Update order status (vendor)
  const updateOrderStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
  
      const hasVendorItem = order.items.some(item => item.vendorId.toString() === req.user.id);
      if (!hasVendorItem && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
  
      order.orderStatus = status;
      await order.save();
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

module.exports = { createOrder, verifyPayment, getMyOrders, getOrderById,getVendorOrders, updateOrderStatus };