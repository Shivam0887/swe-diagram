/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@platform/diagram-schema',
    '@platform/diagram-core',
    '@platform/design-system',
    '@platform/icon-library',
    '@platform/diagram-layout',
    '@platform/diagram-renderer',
    '@platform/export',
    '@platform/db',
  ],
  serverExternalPackages: ['sharp', 'elkjs'],
};

export default nextConfig;
