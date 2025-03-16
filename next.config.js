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
  env: {
    VAR_ORIGINAL_PATHNAME: "/",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
