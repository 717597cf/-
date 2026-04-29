import type { NextConfig } from 'next';
import os from 'os';

function getAllowedDevOrigins(): string[] {
  const base = ['*.dev.coze.site'];
  if (process.env.NODE_ENV !== 'development') return base;

  const port = process.env.DEPLOY_RUN_PORT || process.env.PORT || '5000';
  const hosts = new Set<string>(['localhost', '127.0.0.1', '0.0.0.0']);

  const nics = os.networkInterfaces();
  for (const list of Object.values(nics)) {
    for (const nic of list ?? []) {
      if (!nic || nic.internal) continue;
      if (nic.family !== 'IPv4') continue;
      hosts.add(nic.address);
    }
  }

  const origins: string[] = [];
  for (const host of hosts) {
    origins.push(`${host}:${port}`);
    origins.push(`http://${host}:${port}`);
    origins.push(`https://${host}:${port}`);
  }

  return [...base, ...origins];
}

const nextConfig: NextConfig = {
  // 修复 Turbopack 误判 workspace root 的警告
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: getAllowedDevOrigins(),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
