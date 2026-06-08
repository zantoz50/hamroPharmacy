"use strict";

const Order = require("../models/order.model");
const Invoice = require("../models/invoice.model");
const Inventory = require("../models/inventory.model");
// GET Orders
exports.getOrders = async (req, res) => {
  const orders = await Order.find({ tenantId: req.tenantId });
  res.json(orders);
};

// CREATE Order
// exports.createOrder = async (req, res) => {
//   const { items, totalPrice, customerName, deliveryType, sectorId } = req.body;
//   const newOrder = new Order({
//     items,
//     totalPrice,
//     customerName: "Guest Coustomer",
//     deliveryType,
//     tenantId: req.tenantId,
//     status: "pending",
//     sectorId, // ✅ required field
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });
//   await newOrder.save();
//   res.status(201).json(newOrder);
// };

// // UPDATE Order Status
// exports.updateOrderStatus = async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;
//   const updated = await Order.findOneAndUpdate(
//     { orderId: id, tenantId: req.tenantId },
//     { status, updatedAt: new Date() },
//     { new: true },
//   );
//   if (!updated) return res.status(404).json({ error: "Order not found" });
//   res.json(updated);
// };

exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, customerName, deliveryType, sectorId } =
      req.body;

    // Check stock for each item
    for (const item of items) {
      const inventoryItem = await Inventory.findOne({
        inventoryId: item.inventoryId,
        tenantId: req.tenantId,
      });

      if (!inventoryItem) {
        return res
          .status(404)
          .json({ message: `Item ${item.inventoryId} not found` });
      }

      if (inventoryItem.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${inventoryItem.name}`,
          available: inventoryItem.stock,
        });
      }

      // Reduce stock
      inventoryItem.stock -= item.quantity;

      // Warn if below minStock
      if (inventoryItem.stock <= inventoryItem.minStock) {
        console.warn(
          `⚠️ Stock warning: ${inventoryItem.name} is below minimum threshold`,
        );
      }

      await inventoryItem.save();
    }

    const newOrder = new Order({
      items,
      totalPrice,
      customerName: customerName || "Guest Customer",
      deliveryType,
      tenantId: req.tenantId,
      sectorId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newOrder.save();

    // ✅ Create invoice if order is pending
    if (newOrder.status === "pending") {
      const newInvoice = new Invoice({
        orderId: newOrder.orderId,
        tenantId: req.tenantId,
        sectorId,
        deliveryType,
        totalAmount: totalPrice,
        invoiceDate: new Date(),
        status: "unpaid",
      });

      await newInvoice.save();
    }
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { orderId: id, tenantId: req.tenantId },
      { status, updatedAt: new Date() },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};
