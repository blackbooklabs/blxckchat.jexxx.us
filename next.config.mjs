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

  serverExternalPackages: ["chalk", "blessed", "figlet", "gradient-string", "marked"],
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Compress output for better performance
  compress: true,
  
  // Trailing slashes for consistent URLs
  trailingSlash: true,

  // API routes must not 308-redirect on preflight OPTIONS (breaks cross-origin CORS).
  skipTrailingSlashRedirect: true,

  // CORS for Mini / BLXCKBOOK satellite widgets calling BLXCKCHAT APIs with Bearer auth.
  async headers() {
    const miniCors = [
      { key: 'Access-Control-Allow-Origin', value: 'https://mini.blxckchat.jexxx.us' },
      { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      { key: 'Access-Control-Allow-Credentials', value: 'true' },
      { key: 'Vary', value: 'Origin' },
    ];
    const miniApiPaths = [
      '/api/user-settings',
      '/api/mini/status',
      '/api/mini/agent',
      '/api/projects',
      '/api/chats',
    ];
    return miniApiPaths.map((source) => ({ source, headers: miniCors }));
  },
};

export default nextConfig;

