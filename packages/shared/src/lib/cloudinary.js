const { v2: cloudinary } = require("cloudinary");

let configured = false;

function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/**
 * Uploads a base64/data-URI or remote URL to Cloudinary.
 * `resourceType` is "image" | "video" | "raw" (raw covers .glb/.gltf 3D models).
 */
async function uploadToCloudinary(fileDataUri, { folder = "primevista", resourceType = "image" } = {}) {
  const cld = getCloudinary();
  const result = await cld.uploader.upload(fileDataUri, {
    folder,
    resource_type: resourceType,
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

async function deleteFromCloudinary(publicId, resourceType = "image") {
  const cld = getCloudinary();
  return cld.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { getCloudinary, uploadToCloudinary, deleteFromCloudinary };
