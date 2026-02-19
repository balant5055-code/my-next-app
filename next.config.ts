import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.gstatic.com; " +
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com https://www.google.com https://www.google.com/maps https://www.google.com/maps/embed; " +
              "connect-src 'self' https://*.razorpay.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.googleapis.com; " +
              "img-src 'self' data: https: blob:; " +
              "style-src 'self' 'unsafe-inline'; " +
              "font-src 'self' https: data:; " +
              "frame-ancestors 'self';",
          },
        ],
      },
    ];
  },

  images: {
    domains: [
      "images.unsplash.com",
      "cdn.pixabay.com",
      "upload.wikimedia.org",
      "storage.googleapis.com",
    ],
  },
};

export default nextConfig;
