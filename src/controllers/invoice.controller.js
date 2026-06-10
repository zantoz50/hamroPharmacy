const Invoice = require("../models/invoice.model");
const Order = require("../models/order.model");

exports.createInvoice = async (req, res) => {
  try {
    const {
      orderId,
      sectorId,
      deliveryType,
      invoiceDate,
      totalAmount,
      paymentStatus,
    } = req.body;

    // Validate required fields
    if (!orderId || !sectorId || !deliveryType || !totalAmount) {
      return res.status(400).json({
        message:
          "Missing required fields: orderId, sectorId, deliveryType, totalAmount",
      });
    }

    // Find order to verify it exists
    const order = await Order.findOne({
      orderId: orderId,
      tenantId: req.tenantId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create invoice using provided values
    const invoice = new Invoice({
      orderId,
      tenantId: req.tenantId,
      sectorId,
      deliveryType,
      invoiceDate: invoiceDate || new Date(),
      totalAmount: parseFloat(totalAmount),
      paymentStatus: paymentStatus || "unpaid",
    });

    await invoice.save();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating invoice",
      error: error.message,
    });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ tenantId: req.tenantId }).populate(
      "orderId",
    );

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message,
    });
  }
};
