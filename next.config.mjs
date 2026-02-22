/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for deployment flexibility
  output: "export",
  
  // Image optimization settings for static export
  images: {
    unoptimized: true,
  },
  
  // Strict mode for development best practices
  reactStrictMode: true,
  
  // Experimental features for Next.js 14
  experimental: {
    // Enable app directory features
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Compress output for better performance
  compress: true,
  
  // Trailing slashes for consistent URLs
  trailingSlash: true,
};

export default nextConfig;
