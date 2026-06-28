"use strict";

const Order = require("../models/order.model");
const { Invoice, MasterInvoice } = require("../models/invoice.model");
const Inventory = require("../models/inventory.model");
const invoiceController = require("./invoice.controller"); // where createMasterInvoice lives
const Notification = require("../models/notification.model");
// GET Orders
exports.getOrders = async (req, res) => {
  const orders = await Order.find({ tenantId: req.tenantId });
  res.json(orders);
};

// CREATE Order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, customerName, deliveryType, sectorId, tableNo } =
      req.body;

    // Stock check
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

      inventoryItem.stock -= item.quantity;
      if (inventoryItem.stock <= inventoryItem.minStock) {
        console.warn(
          `⚠️ Stock warning: ${inventoryItem.name} is below minimum threshold`,
        );
      }
      await inventoryItem.save();
    }
    // ✅ Call your external createMasterInvoice method

    const newOrder = new Order({
      items,
      totalPrice,
      customerName: customerName || "Guest Customer",
      deliveryType,
      tenantId: req.tenantId,
      sectorId,
      tableNo, // optional field
      status: "pending",
    });

    await newOrder.save();
    try {
      await invoiceController.createMasterInvoice(newOrder);
    } catch (err) {
      // rollback tenant if preference creation fails
      await Order.deleteOne({ orderId: newOrder.orderId });
      return res.status(500).json({
        message: "Failed to create Master Invoice",
        error: err.message,
      });
    }
    // 🔔 Create notification
    await Notification.create({
      tenantId: req.tenantId,
      eventType: "ORDER_CREATED",
      eventId: newOrder.orderId?.toString(),
      data: {
        customerId: newOrder.customerId,
        customerName: newOrder.customerName,
      },
      message: `Order ${newOrder.masterInvoiceId} created!`,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
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
