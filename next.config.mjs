/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Warning: this allows all ESLint errors and warnings
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Warning: this allows all TypeScript errors
      ignoreBuildErrors: true,
    },
  }
  
  module.exports = nextConfig