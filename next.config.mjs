/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization settings
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

  serverExternalPackages: ["chalk", "blessed", "figlet", "gradient-string", "marked"],
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Compress output for better performance
  compress: true,
  
  // Trailing slashes for consistent URLs
  trailingSlash: true,
};

export default nextConfig;
