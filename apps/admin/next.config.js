/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Uploads travel to /api/proxy/media/upload as a base64 data URI in a JSON
    // body, and every request here passes through proxy.js, which truncates
    // bodies at 10MB by default. A truncated body is unparseable JSON, so the
    // upload failed as a confusing 400 rather than a size error.
    //
    // Base64 inflates a file by ~33%, so this ceiling has to clear the largest
    // file ImageUploader accepts (20MB video → ~27MB encoded) with headroom.
    // (`middlewareClientMaxBodySize` is the deprecated name for this, and
    // setting both is a hard error.)
    proxyClientMaxBodySize: "32mb",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;
