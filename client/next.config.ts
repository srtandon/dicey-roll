import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Three.js and react-3d-dice ship as ESM — Next.js needs to transpile them
    transpilePackages: ['three', 'react-3d-dice'],

    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/api/:path*',
            },
        ];
    },
};

export default nextConfig;
