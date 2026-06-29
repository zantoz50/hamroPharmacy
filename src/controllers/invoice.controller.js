const { MasterInvoice, Invoice } = require("../models/invoice.model");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");
const { Sector } = require("../models/utilits.model");
const Notification = require("../models/notification.model");

exports.createMasterInvoice = async (order) => {
  try {
    let totalAmount = 0;
    const childInvoices = [];

    // Collect unique sectorIds from order items
    const sectorIds = [...new Set(order.items.map((si) => si.sectorId))];
    // Fetch sector names from Sector table
    const sectors = await Sector.find({ sectorId: { $in: sectorIds } });
    const sectorNames = sectors.map((s) => s.name);

    const masterInvoice = new MasterInvoice({
      tenantId: order.tenantId,
      customerName: order.customerName,
      customerId: order.customerId,
      tableNo: order.tableNo,
      totalAmount: order.totalPrice,
      orderId: order.orderId,
      paymentType: "cash",
      paymentStatus: "unpaid",
      childInvoices: [],
      sectorIds: sectorIds,
      sectorNames: sectorNames,
    });

    await masterInvoice.save();

    // Group items by sectorId
    const itemsBySector = {};
    for (const si of order.items) {
      if (!itemsBySector[si.sectorId]) {
        itemsBySector[si.sectorId] = [];
      }
      itemsBySector[si.sectorId].push({
        sectorId: si.sectorId,
        inventoryId: si.inventoryId,
        name: si.name,
        quantity: si.quantity,
        sku: si.sku,
        originalPrice: si.originalPrice,
        totalPrice: si.quantity * si.originalPrice,
      });
    }

    // for (const si of order) {
    //   const childInvoice = new Invoice({
    //     masterInvoiceId: masterInvoice.masterInvoiceId,
    //     tenantId,
    //     sectorId: si.sectorId,
    //     orderId: orderId,
    //     deliveryType: deliveryType,
    //     totalAmount: si.quantity * si.priceOnOrder,
    //     paymentType: "cash",
    //     paymentStatus: "unpaid",
    //   });

    //   await childInvoice.save();
    //   childInvoices.push(childInvoice);
    //   totalAmount += si.quantity * si.priceOnOrder;
    // }

    // Create one invoice per sector with grouped items
    for (const [sectorId, items] of Object.entries(itemsBySector)) {
      const sectorTotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

      const childInvoice = new Invoice({
        masterInvoiceId: masterInvoice.masterInvoiceId,
        tenantId: masterInvoice.tenantId,
        sectorId: sectorId,
        orderId: masterInvoice.orderId,
        customerName: masterInvoice.customerName,
        customerId: masterInvoice.customerId,
        deliveryType: "dine-in",
        totalAmount: sectorTotal,
        paymentType: "cash",
        paymentStatus: "unpaid",
        items,
      });

      await childInvoice.save();
      childInvoices.push(childInvoice);
      totalAmount += sectorTotal;
    }
    masterInvoice.childInvoices = childInvoices;
    masterInvoice.totalAmount = totalAmount;
    await masterInvoice.save();
    return masterInvoice;
  } catch (error) {
    throw new Error("Error creating master invoice: " + error.message);
  }
};

exports.getMasterInvoice = async (req, res) => {
  try {
    // Fetch master invoices and populate child invoices deeply
    const masterInvoices = await MasterInvoice.find({
      tenantId: req.tenantId,
    }).populate({
      path: "childInvoices", // references Invoice model
      populate: [
        { path: "orderId" }, // populate order inside invoice
        { path: "sectorId" }, // populate sector inside invoice
      ],
    });

    if (!masterInvoices || masterInvoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    // Build response per master invoice
    const response = masterInvoices.map((master) => {
      const totalAmount = master.childInvoices.reduce(
        (sum, inv) => sum + inv.totalAmount,
        0,
      );
      const totalCredits = master.childInvoices.reduce(
        (sum, inv) => sum + (inv.creditAmount || 0),
        0,
      );

      return {
        _id: master._id,
        masterInvoiceId: master.masterInvoiceId,
        tenantId: master.tenantId,
        customerName: master.customerName,
        orderId: master.orderId,
        invoiceCount: master.childInvoices.length,
        childInvoices: master.childInvoices, // full populated invoices
        sectorIds: master.sectorIds,
        sectorNames: master.sectorNames,
        tableNo: master.tableNo,
        invoiceDate: master.invoiceDate,
        paymentStatus: master.paymentStatus,
        paymentType: master.paymentType,
        summary: {
          totalAmount,
          totalCredits,
          netPayable: totalAmount - totalCredits,
        },
      };
    });

    res.status(200).json(response.length > 0 ? response : []);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching master invoice",
      error: error.message,
    });
  }
};

exports.updateMasterInvoice = async (req, res) => {
  try {
    const { masterInvoiceId, orderId, paymentStatus, customerId } = req.body;

    if ((!masterInvoiceId && !orderId) || !paymentStatus) {
      return res.status(400).json({
        message:
          "Missing required fields: masterInvoiceId or orderId, and paymentStatus",
      });
    }

    // Build query: either masterInvoiceId or orderId
    const query = {
      tenantId: req.tenantId,
      ...(masterInvoiceId ? { masterInvoiceId } : { orderId }),
    };

    // Find master invoice
    const masterInvoice =
      await MasterInvoice.findOne(query).populate("childInvoices");
    if (!masterInvoice) {
      return res.status(404).json({ message: "Master invoice not found" });
    }

    // Update master invoice payment status
    masterInvoice.paymentStatus = paymentStatus;

    // If customerId is provided, fetch customer and update details
    if (customerId !== undefined && customerId !== null) {
      const customer = await Customer.findOne({
        customerId,
        tenantId: req.tenantId,
      });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      masterInvoice.customerId = customerId;
      masterInvoice.customerName = customer.name; // assuming 'name' field exists

      // If payment type is credit, update customer's credit balance
      if (masterInvoice.paymentType === "credit") {
        customer.creditBalance =
          (customer.creditBalance || 0) + masterInvoice.totalAmount;
        await customer.save();
      }
    }
    await masterInvoice.save();

    // If master invoice is paid, update all child invoices
    if (paymentStatus === "paid") {
      await Invoice.updateMany(
        { masterInvoiceId: masterInvoice.masterInvoiceId },
        { $set: { paymentStatus: "paid", status: "completed" } },
      );
    }

    // 🔔 Create notification
    await Notification.create({
      tenantId: req.tenantId,
      eventType: "INVOICE_UPDATED",
      eventId: masterInvoice.masterInvoiceId.toString(),
      sectorId: sectorId,
      data: {
        paymentStatus,
        customerId: masterInvoice.customerId,
        customerName: masterInvoice.customerName,
      },
      message: `Invoice ${masterInvoice.masterInvoiceId} updated with status ${paymentStatus}`,
    });

    res.status(200).json({
      message: "Invoice status updated successfully",
      masterInvoice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating invoice status",
      error: error.message,
    });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const {
      orderId,
      sectorId,
      deliveryType,
      invoiceDate,
      totalAmount,
      paymentType,
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
      paymentType,
      creditAmount: paymentType === "credit" ? totalAmount : 0,
      status: "pending",
      paymentStatus: paymentStatus || "unpaid",
    });

    await invoice.save();

    // // Update customer credit balance if credit
    if (paymentType === "credit") {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { creditBalance: totalAmount },
      });
    }

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

    res.status(200).json(invoices.length > 0 ? invoice : []);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message,
    });
  }
};

exports.updateChildInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const invoice = await Invoice.findByIdAndUpdate(id, updates, { new: true });

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Recalculate master invoice total
    if (invoice.masterInvoiceId) {
      const master = await MasterInvoice.findById(
        invoice.masterInvoiceId,
      ).populate("childInvoices");
      const newTotal = master.childInvoices.reduce(
        (sum, inv) => sum + inv.totalAmount,
        0,
      );
      master.totalAmount = newTotal;
      await master.save();
    }

    res.status(200).json({ message: "Child invoice updated", invoice });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating child invoice", error: error.message });
  }
};
