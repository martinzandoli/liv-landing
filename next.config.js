/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Esto hace que "/" sirva directamente tu imagen
      { source: '/', destination: '/hero.png' },
    ];
  },
};

module.exports = nextConfig;
