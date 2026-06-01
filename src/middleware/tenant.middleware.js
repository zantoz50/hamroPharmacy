// middleware/tenant.middleware.js
module.exports = (req, res, next) => {
  try {
    // If using JWT, tenantId can come from decoded token
    if (req.user && req.user.tenantId) {
      req.tenantId = req.user.tenantId;
    }

    // Or fallback: derive from companyName in body (for signup/register flows)
    if (!req.tenantId && req.body.companyName) {
      req.tenantId = req.body.companyName.trim();
    }

    if (!req.tenantId) {
      return res.status(400).json({ message: "TenantId is required" });
    }

    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error resolving tenantId", error: err.message });
  }
};
