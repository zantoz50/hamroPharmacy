const Customer = require("../models/customer.model");
const Tenant = require("../models/tenant.model");
// CREATE
exports.addCustomer = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      phoneNumber,
      companyName,
    } = req.body;

    const tenant = await Tenant.findOne({ companyName: companyName.trim() });
    if (!tenant) return res.status(404).json({ error: "Company not found" });

    const exists = await Customer.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return res
        .status(409)
        .json({ error: "Email or username already in use" });

    const customer = new Customer({
      email,
      username,
      password,
      firstName,
      lastName,
      phoneNumber,
      companyName: tenant.companyName,
      tenantId: tenant._id,
    });

    await customer.save();
    res.status(201).json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ALL
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ tenantId: req.tenantId });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateCustomer = async (req, res) => {
  try {
    const updates = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      updates,
      { new: true },
    );
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerWithCredits = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // Aggregate credits from invoices
    const result = await Invoice.aggregate([
      {
        $match: {
          customerId: new mongoose.Types.ObjectId(customerId),
          paymentType: "credit",
        },
      },
      {
        $group: { _id: "$customerId", totalCredits: { $sum: "$creditAmount" } },
      },
    ]);

    const totalCredits = result.length > 0 ? result[0].totalCredits : 0;

    res.json({ customer, creditBalance: totalCredits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerInvoices = async (req, res) => {
  try {
    const { customerId } = req.params;

    const invoices = await Invoice.find({ customerId }).sort({ createdAt: -1 });
    res.json({ customerId, invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
