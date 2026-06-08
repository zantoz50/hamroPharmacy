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

    // Find order
    const order = await Order.findOne({
      invoiceId: req.invoiceId,
      tenantId: req.tenantId,
    }).populate("sectorId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create invoice from order
    const invoice = new Invoice({
      orderId: order.orderId,
      tenantId: order.tenantId,
      sectorId: order.sectorId,
      deliveryType: order.deliveryType,
      totalAmount: order.totalPrice,
      paymentStatus: order.paymentStatus,
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
    const invoices = await Invoice.find({ tenantId: req.tenantId })
      .populate("orderId")
      .populate("sectorId");

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message,
    });
  }
};
