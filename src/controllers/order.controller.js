"use strict";

const Order = require("../models/order.model");

// GET Orders
exports.getOrders = async (req, res) => {
  const orders = await Order.find({ tenantId: req.tenantId });
  res.json(orders);
};

// CREATE Order
exports.createOrder = async (req, res) => {
  const { items, totalPrice, customerName, deliveryType } = req.body;
  const newOrder = new Order({
    items,
    totalPrice,
    customerName,
    deliveryType,
    tenantId: req.tenantId,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await newOrder.save();
  res.status(201).json(newOrder);
};

// UPDATE Order Status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await Order.findOneAndUpdate(
    { _id: id, tenantId: req.tenantId },
    { status, updatedAt: new Date() },
    { new: true },
  );
  if (!updated) return res.status(404).json({ error: "Order not found" });
  res.json(updated);
};
