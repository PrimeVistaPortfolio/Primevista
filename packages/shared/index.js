const { dbConnect } = require("./src/db/connect");
const models = require("./src/models");
const schemas = require("./src/schemas");
const { SERVICE_CATEGORIES, SERVICE_CATALOG_SEED, slugify } = require("./src/constants/serviceCatalog");
const themeRegions = require("./src/constants/themeRegions");
const { signAdminToken, verifyAdminToken, ADMIN_COOKIE_NAME } = require("./src/lib/jwt");
const { getCloudinary, uploadToCloudinary, deleteFromCloudinary } = require("./src/lib/cloudinary");
const { sendMail, notifyAdminOfInquiry, sendInquiryConfirmation } = require("./src/lib/email");
const { rateLimit } = require("./src/lib/rateLimit");
const { sanitizeHtml } = require("./src/lib/sanitize");

module.exports = {
  dbConnect,
  ...models,
  ...schemas,
  SERVICE_CATEGORIES,
  SERVICE_CATALOG_SEED,
  slugify,
  ...themeRegions,
  signAdminToken,
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
  getCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  sendMail,
  notifyAdminOfInquiry,
  sendInquiryConfirmation,
  rateLimit,
  sanitizeHtml,
};
