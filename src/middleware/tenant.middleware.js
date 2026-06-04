// middleware/tenant.middleware.js
// module.exports = (req, res, next) => {
//   try {
//     // If using JWT, tenantId can come from decoded token
//     if (req.user && req.user.tenantId) {
//       req.tenantId = req.user.tenantId;
//     }

//     // Or fallback: derive from companyName in body (for signup/register flows)
//     if (!req.tenantId && req.body.companyName) {
//       req.tenantId = req.body.companyName.trim();
//     }

//     if (!req.tenantId) {
//       return res.status(400).json({ message: "TenantId is required" });
//     }

//     next();
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Error resolving tenantId", error: err.message });
//   }
// };

const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config");
module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // remove "Bearer"
    const decoded = jwt.verify(token, jwtConfig.secret);

    if (!decoded.tenantId) {
      return res.status(400).json({ message: "TenantId is required" });
    }

    req.tenantId = decoded.tenantId; // ✅ attach tenantId
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
};
