import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: false, // Temporarily enabled for local Push Notification testing
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
