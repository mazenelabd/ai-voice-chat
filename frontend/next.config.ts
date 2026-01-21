import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  webpack: (config) => {
    // Prioritize frontend node_modules and prevent looking in parent directories
    config.resolve.modules = [path.resolve(__dirname, 'node_modules')];

    // Set root to frontend directory to prevent looking in parent directories
    config.resolveRoot = path.resolve(__dirname);

    // Prevent webpack from resolving modules in parent directories
    config.resolve.symlinks = false;

    return config;
  },
};

export default nextConfig;
