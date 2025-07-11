/** @type {import('next').NextConfig} */
const nextConfig = { experimental: { turbo: { loaders: { '.js': ['default'] } } } }

export default nextConfig
