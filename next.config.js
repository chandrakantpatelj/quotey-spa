/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    // Add alias for apexcharts to use a custom version
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    // Enable top-level await feature
    config.experiments = config.experiments || {}
    config.experiments.topLevelAwait = true

    return config
  }
}

module.exports = nextConfig
