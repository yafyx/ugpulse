const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["nextui.org", "studentsite.gunadarma.ac.id"],
  },
  experimental: {
    turbo: {
      enabled: true,
    },
    serverComponentsExternalPackages: ["cheerio"],
  },
};

module.exports = withPWA(nextConfig);
