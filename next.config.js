import nextPWA from "next-pwa";

const withPWA = nextPWA({
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
  serverExternalPackages: ["cheerio"],
  experimental: {
    turbo: {
      enabled: true,
    },
  },
};

export default withPWA(nextConfig);
