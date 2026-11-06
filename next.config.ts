import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Accounts were removed; old sign-up links land on the password page.
  redirects: async () => [{ source: '/sign-up', destination: '/sign-in', permanent: false }],
};

export default nextConfig;
