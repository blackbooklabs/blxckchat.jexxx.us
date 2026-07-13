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
    // Kingdom Agent loads vendored jexxx.us-cli dist via runtime import()
    outputFileTracingIncludes: {
      "/api/agent": [
        "./vendor/jexxxus-cli/package.json",
        "./vendor/jexxxus-cli/package-lock.json",
        "./vendor/jexxxus-cli/patches/**/*",
        "./vendor/jexxxus-cli/dist/**/*",
        "./vendor/jexxxus-cli/node_modules/**/*",
      ],
    },
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
