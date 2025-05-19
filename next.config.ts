/** @type {import('next').NextConfig} */
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            dimensions: false,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
